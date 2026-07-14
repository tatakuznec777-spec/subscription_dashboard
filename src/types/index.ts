// Типы для обязательств
export type ObligationStatus = 'active' | 'cancelled';

export type ObligationCategory = 'subscription' | 'insurance' | 'warranty' | 'other';

export interface Obligation {
  id: number;
  name: string;
  category: ObligationCategory;
  amount: number;
  currency: string;
  next_payment_date: string;
  status: ObligationStatus;
  recurrence: string | null;
  created_at: string;
  updated_at: string;
}

// Типы для платежей
export interface Payment {
  id: number;
  obligation_id: number;
  amount: number;
  currency: string;
  paid_at: string;
}

// Типы для API ответов
export interface UpcomingResponse {
  renewal_alerts: Obligation[];
}

export interface ObligationsResponse {
  items: Obligation[];
  total: number;
}

// Типы для SSE событий
export type SSEEventType = 
  | 'obligation_created'
  | 'obligation_updated'
  | 'obligation_deleted'
  | 'payment_recorded';

export interface SSEEvent {
  type: SSEEventType;
  data: Obligation | Payment;
}

// Типы для фильтров
export interface Filters {
  category: ObligationCategory | '';
  q: string;
}