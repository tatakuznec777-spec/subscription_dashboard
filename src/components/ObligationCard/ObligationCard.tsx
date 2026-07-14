import { Obligation } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate, getDaysUntil } from '@/utils/date';

interface ObligationCardProps {
  obligation: Obligation;
  isUpcoming?: boolean;
  onCancel?: (id: number) => void;
  onClick?: () => void;
  isExiting?: boolean;
}

export const ObligationCard = ({ obligation, isUpcoming = false, onCancel, onClick, isExiting = false }: ObligationCardProps) => {
  const daysUntil = getDaysUntil(obligation.next_payment_date);
  
  let urgencyColor = 'var(--color-text-secondary)';
  let urgencyText = `${daysUntil} дн.`;
  
  if (daysUntil <= 3) {
    urgencyColor = 'var(--color-danger)';
    urgencyText = daysUntil <= 0 ? 'Сегодня!' : `Через ${daysUntil} дн.`;
  } else if (daysUntil <= 7) {
    urgencyColor = 'var(--color-warning)';
  }

  const categoryLabels: Record<string, string> = {
    subscription: 'Подписка',
    insurance: 'Страховка',
    warranty: 'Гарантия',
    other: 'Другое',
  };

  return (
    <div 
      className={`animate-enter ${isExiting ? 'animate-exit' : ''}`}
      onClick={onClick}
      style={{ 
        backgroundColor: 'var(--color-card)', 
        border: `1px solid ${urgencyColor}`, 
        borderLeftWidth: '4px',
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '12px', 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{obligation.name}</h3>
          <span style={{ fontSize: '12px', backgroundColor: 'var(--color-bg)', padding: '2px 8px', borderRadius: '4px', color: 'var(--color-text-secondary)' }}>
            {categoryLabels[obligation.category]}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(obligation.amount, obligation.currency)}</div>
          <div style={{ fontSize: '12px', color: urgencyColor, fontWeight: '600', marginTop: '4px' }}>
            {urgencyText}
          </div>
        </div>
      </div>
      
      <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
        Следующий платеж: {formatDate(obligation.next_payment_date)}
      </div>

      {isUpcoming && onCancel && (
        <button 
          onClick={(e) => { e.stopPropagation(); onCancel(obligation.id); }}
          style={{ width: '100%', padding: '8px', backgroundColor: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
        >
          Отменить автопродление
        </button>
      )}
    </div>
  );
};