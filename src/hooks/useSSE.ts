import { useEffect, useRef, useCallback } from 'react';
import { SSEEvent } from '../types';

type EventHandler = (event: SSEEvent) => void;

export const useSSE = (url: string, onEvent: EventHandler) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorCountRef = useRef(0);
  const maxErrors = 3; // Максимум 3 попытки подключения

  const connect = useCallback(() => {
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
      console.log('SSE not available (SSR or no EventSource support)');
      return;
    }

    // Если слишком много ошибок, прекращаем попытки
    if (errorCountRef.current >= maxErrors) {
      console.log('SSE: Too many errors, stopping reconnection attempts');
      return;
    }

    console.log('Connecting to SSE...');
    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        errorCountRef.current = 0; // Сбрасываем счетчик ошибок при успешном подключении
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          onEvent(data);
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        errorCountRef.current++;
        
        // Закрываем соединение
        eventSource.close();
        
        // Пробуем переподключиться только если ошибок меньше максимума
        if (errorCountRef.current < maxErrors) {
          console.log(`SSE: Reconnecting attempt ${errorCountRef.current}/${maxErrors} in 5s...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        } else {
          console.warn('SSE: Connection failed after multiple attempts. Real-time updates disabled.');
        }
      };
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      errorCountRef.current++;
    }
  }, [url, onEvent]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Проверяем существование EventSource
  const isConnected = typeof window !== 'undefined' && 
                      typeof EventSource !== 'undefined' &&
                      eventSourceRef.current?.readyState === EventSource.OPEN;

  return {
    isConnected,
  };
};