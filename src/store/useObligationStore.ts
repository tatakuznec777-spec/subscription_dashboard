import { create } from 'zustand';
import { Obligation, Payment, Filters } from '../types';

interface ObligationState {
  obligations: Obligation[];
  upcoming: Obligation[];
  selectedObligation: Obligation | null;
  payments: Payment[];
  filters: Filters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setObligations: (obligations: Obligation[]) => void;
  setUpcoming: (upcoming: Obligation[]) => void;
  addObligation: (obligation: Obligation) => void;
  updateObligation: (id: number, updates: Partial<Obligation>) => void;
  removeObligation: (id: number) => void;
  setSelectedObligation: (obligation: Obligation | null) => void;
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useObligationStore = create<ObligationState>((set) => ({
  obligations: [],
  upcoming: [],
  selectedObligation: null,
  payments: [],
  filters: {
    category: '',
    q: '',
  },
  isLoading: false,
  error: null,

  setObligations: (obligations) => set({ obligations }),
  setUpcoming: (upcoming) => set({ upcoming }),
  addObligation: (obligation) => set((state) => ({
    obligations: [...state.obligations, obligation],
  })),
  updateObligation: (id, updates) => set((state) => ({
    obligations: state.obligations.map((obs) =>
      obs.id === id ? { ...obs, ...updates } : obs
    ),
    upcoming: state.upcoming.map((obs) =>
      obs.id === id ? { ...obs, ...updates } : obs
    ),
    selectedObligation: state.selectedObligation?.id === id
      ? { ...state.selectedObligation, ...updates }
      : state.selectedObligation,
  })),
  removeObligation: (id) => set((state) => ({
    obligations: state.obligations.filter((obs) => obs.id !== id),
    upcoming: state.upcoming.filter((obs) => obs.id !== id),
    selectedObligation: state.selectedObligation?.id === id
      ? null
      : state.selectedObligation,
  })),
  setSelectedObligation: (obligation) => set({ selectedObligation: obligation }),
  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({
    payments: [payment, ...state.payments],
  })),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  resetFilters: () => set({ filters: { category: '', q: '' } }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));