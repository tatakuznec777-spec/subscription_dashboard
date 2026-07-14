import { useEffect, useRef, useCallback } from 'react';
import { SSEEvent } from '../types';

type EventHandler = (event: SSEEvent) => void;

export const useSSE = (url: string, onEvent: EventHandler) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
      console.log('SSE not available (SSR or no EventSource support)');
      return;
    }

    console.log('Connecting to SSE...');
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection opened');
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
      eventSource.close();
      
      // Переподключение через 5 секунд
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };
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
  const isConnected = typeof window !== 'undefined' && typeof EventSource !== 'undefined' && eventSourceRef.current?.readyState === EventSource.OPEN;

  return {
    isConnected,
  };
};