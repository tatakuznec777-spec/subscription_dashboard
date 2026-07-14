import { useObligationStore } from '@/store/useObligationStore';
import { formatCurrency } from '@/utils/currency';
import { isCurrentMonth } from '@/utils/date';

export const Header = () => {
  const { obligations, filters } = useObligationStore();
  // В реальном SSE хуке мы будем получать isConnected, пока заглушка true
  const isConnected = true; 

  // Фильтруем обязательства для подсчета суммы (активные и в текущем месяце)
  const filteredObligations = obligations.filter((obs) => {
    const matchesCategory = !filters.category || obs.category === filters.category;
    const matchesSearch = !filters.q || obs.name.toLowerCase().includes(filters.q.toLowerCase());
    return obs.status === 'active' && isCurrentMonth(obs.next_payment_date) && matchesCategory && matchesSearch;
  });

  // Группируем сумму по валютам
  const totalByCurrency = filteredObligations.reduce((acc, obs) => {
    acc[obs.currency] = (acc[obs.currency] || 0) + obs.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalString = Object.entries(totalByCurrency)
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(' · ');

  return (
    <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Мои обязательства</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }}>
          К оплате в этом месяце: <strong style={{ color: 'var(--color-text)' }}>{totalString || '0 ₽'}</strong>
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {isConnected ? 'Данные актуальны' : 'Переподключение...'}
        </span>
        <div 
          style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: isConnected ? 'var(--color-success)' : 'var(--color-text-secondary)' 
          }} 
        />
      </div>
    </header>
  );
};