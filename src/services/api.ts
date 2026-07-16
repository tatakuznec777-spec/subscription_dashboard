import axios from 'axios';
import { Obligation, Payment, UpcomingResponse, ObligationsResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gitverse.ru/semao0/mock_api_irg';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock данные
const mockObligations: ObligationsResponse = {
  items: [
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
    {
      id: 2,
      name: 'Netflix',
      category: 'subscription',
      amount: 9.99,
      currency: 'USD',
      next_payment_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
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
  } catch {
    console.warn('API недоступен, используем mock данные');
    return mockObligations;
  }
};

// Получить предстоящие платежи
export const getUpcoming = async (): Promise<UpcomingResponse> => {
  try {
    const response = await api.get<UpcomingResponse>('/upcoming');
    return response.data;
  } catch {
    console.warn('API недоступен, используем mock данные');
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
  } catch {
    console.warn('История платежей недоступна');
    return [
      {
        id: 1,
        obligation_id: obligationId,
        amount: 199,
        currency: 'RUB',
        paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }
};

// Оплатить обязательство (MOCK)
export const payObligation = async (id: number): Promise<Obligation> => {
  try {
    const response = await api.post<Obligation>(`/obligations/${id}/pay`);
    return response.data;
  } catch {
    console.log('Mock: оплата выполнена локально');
    // Возвращаем mock обновленное обязательство
    const mockObligation = mockObligations.items.find(o => o.id === id);
    if (!mockObligation) throw new Error('Obligation not found');
    
    const nextDate = new Date(mockObligation.next_payment_date);
    if (mockObligation.recurrence === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (mockObligation.recurrence === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    
    return {
      ...mockObligation,
      next_payment_date: nextDate.toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
};

// Отменить обязательство (MOCK)
export const cancelObligation = async (id: number): Promise<Obligation> => {
  try {
    const response = await api.patch<Obligation>(`/obligations/${id}/cancel`);
    return response.data;
  } catch {
    console.log('Mock: отмена выполнена локально');
    const mockObligation = mockObligations.items.find(o => o.id === id);
    if (!mockObligation) throw new Error('Obligation not found');
    
    return {
      ...mockObligation,
      status: 'cancelled' as const,
      updated_at: new Date().toISOString(),
    };
  }
};

// Удалить обязательство (MOCK)
export const deleteObligation = async (id: number): Promise<void> => {
  try {
    await api.delete(`/obligations/${id}`);
  } catch {
    console.log('Mock: удаление выполнено локально');
    // Ничего не делаем, удаление уже произошло в UI оптимистично
  }
};

export default api;