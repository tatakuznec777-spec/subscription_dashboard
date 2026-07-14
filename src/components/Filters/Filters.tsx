'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useObligationStore } from '@/store/useObligationStore';
import { ObligationCategory } from '@/types';

const CATEGORIES: { value: ObligationCategory | ''; label: string }[] = [
  { value: '', label: 'Все категории' },
  { value: 'subscription', label: 'Подписки' },
  { value: 'insurance', label: 'Страховки' },
  { value: 'warranty', label: 'Гарантии' },
  { value: 'other', label: 'Другое' },
];

// Отдельный компонент, который использует useSearchParams
function FiltersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setFilters, resetFilters } = useObligationStore();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.push(`?${params.toString()}`, { scroll: false });
    setFilters({ category: category as ObligationCategory | '' });
  };

  const handleSearchChange = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    router.push(`?${params.toString()}`, { scroll: false });
    setFilters({ q });
  };

  const handleReset = () => {
    router.push('/', { scroll: false });
    resetFilters();
  };

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <input
        type="text"
        placeholder="Поиск по названию..."
        value={searchParams.get('q') || ''}
        onChange={(e) => handleSearchChange(e.target.value)}
        style={{
          flex: 1,
          minWidth: '200px',
          padding: '10px 14px',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
      />
      <select
        value={searchParams.get('category') || ''}
        onChange={(e) => handleCategoryChange(e.target.value)}
        style={{
          padding: '10px 14px',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          fontSize: '14px',
          minWidth: '180px',
          cursor: 'pointer',
          outline: 'none',
          backgroundColor: 'white',
        }}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleReset}
        style={{
          padding: '10px 20px',
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget.style.backgroundColor = 'var(--color-border)');
        }}
        onMouseLeave={(e) => {
          (e.currentTarget.style.backgroundColor = 'var(--color-bg)');
        }}
      >
        Сбросить
      </button>
    </div>
  );
}

// Основной компонент с Suspense boundary
export const Filters = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: '200px',
              height: '42px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '6px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '180px',
              height: '42px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '6px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '100px',
              height: '42px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '6px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      }
    >
      <FiltersContent />
    </Suspense>
  );
};