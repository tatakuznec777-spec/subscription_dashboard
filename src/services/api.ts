import axios from 'axios';
import { Obligation, Payment, UpcomingResponse, ObligationsResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gitverse.ru/semao0/mock_api_irg';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock данные для демонстрации (если API недоступен)
const mockObligations: ObligationsResponse = {
  items: [
    {
      id: 1,
      name: 'Яндекс Плюс',
      category: 'subscription',
      amount: 199,
      currency: 'RUB',
      next_payment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // через 2 дня
      status: 'active',
      recurrence: 'monthly',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Netflix',
      category: 'subscription',
      amount: 9.99,
      currency: 'USD',
      next_payment_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // через 5 дней
      status: 'active',
      recurrence: 'monthly',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  total: 2,
};

const mockUpcoming: UpcomingResponse = {
  renewal_alerts: [
    {
      id: 1,
      name: 'Яндекс Плюс',
      category: 'subscription',
      amount: 199,
      currency: 'RUB',
      next_payment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      recurrence: 'monthly',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

// Получить все обязательства
export const getObligations = async (): Promise<ObligationsResponse> => {
  try {
    const response = await api.get<ObligationsResponse>('/obligations');
    return response.data;
  } catch (error) {
    console.warn('API недоступен, используем mock данные:', error);
    return mockObligations;
  }
};

// Получить предстоящие платежи
export const getUpcoming = async (): Promise<UpcomingResponse> => {
  try {
    const response = await api.get<UpcomingResponse>('/upcoming');
    return response.data;
  } catch (error) {
    console.warn('API недоступен, используем mock данные:', error);
    return mockUpcoming;
  }
};

// Получить обязательство по ID
export const getObligationById = async (id: number): Promise<Obligation> => {
  const response = await api.get<Obligation>(`/obligations/${id}`);
  return response.data;
};

// Получить историю платежей
export const getPayments = async (obligationId: number): Promise<Payment[]> => {
  try {
    const response = await api.get<Payment[]>(`/obligations/${obligationId}/payments`);
    return response.data;
  } catch (error) {
    console.warn('История платежей недоступна:', error);
    return [];
  }
};

// Оплатить обязательство
export const payObligation = async (id: number): Promise<Obligation> => {
  const response = await api.post<Obligation>(`/obligations/${id}/pay`);
  return response.data;
};

// Отменить обязательство
export const cancelObligation = async (id: number): Promise<Obligation> => {
  const response = await api.patch<Obligation>(`/obligations/${id}/cancel`);
  return response.data;
};

// Удалить обязательство
export const deleteObligation = async (id: number): Promise<void> => {
  await api.delete(`/obligations/${id}`);
};

export default api;