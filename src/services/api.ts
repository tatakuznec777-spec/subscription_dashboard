import axios from 'axios';
import { Obligation, Payment, UpcomingResponse, ObligationsResponse } from '../types';

const API_BASE_URL = 'https://gitverse.ru/semao0/mock_api_irg';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Получить все обязательства
export const getObligations = async (): Promise<ObligationsResponse> => {
  const response = await api.get<ObligationsResponse>('/obligations');
  return response.data;
};

// Получить предстоящие платежи
export const getUpcoming = async (): Promise<UpcomingResponse> => {
  const response = await api.get<UpcomingResponse>('/upcoming');
  return response.data;
};

// Получить обязательство по ID
export const getObligationById = async (id: number): Promise<Obligation> => {
  const response = await api.get<Obligation>(`/obligations/${id}`);
  return response.data;
};

// Получить историю платежей
export const getPayments = async (obligationId: number): Promise<Payment[]> => {
  const response = await api.get<Payment[]>(`/obligations/${obligationId}/payments`);
  return response.data;
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