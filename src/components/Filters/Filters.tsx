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

export const Filters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setFilters, resetFilters } = useObligationStore();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set('category', category);
    else params.delete('category');
    router.push(`?${params.toString()}`);
    setFilters({ category: category as ObligationCategory | '' });
  };

  const handleSearchChange = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('q', q);
    else params.delete('q');
    router.push(`?${params.toString()}`);
    setFilters({ q });
  };

  const handleReset = () => {
    router.push('/');
    resetFilters();
  };

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <input
        type="text"
        placeholder="Поиск по названию..."
        value={searchParams.get('q') || ''}
        onChange={(e) => handleSearchChange(e.target.value)}
        style={{ flex: 1, padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '14px' }}
      />
      <select
        value={searchParams.get('category') || ''}
        onChange={(e) => handleCategoryChange(e.target.value)}
        style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '14px', minWidth: '180px' }}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>{cat.label}</option>
        ))}
      </select>
      <button 
        onClick={handleReset}
        style={{ padding: '10px 16px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
      >
        Сбросить
      </button>
    </div>
  );
};