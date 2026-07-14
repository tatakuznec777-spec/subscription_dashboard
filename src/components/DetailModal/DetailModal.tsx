'use client';

import { useState } from 'react';
import { Obligation, Payment } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

interface DetailModalProps {
  obligation: Obligation | null;
  payments: Payment[];
  isOpen: boolean;
  onClose: () => void;
  onPay: (id: number) => void;
  onCancel: (id: number) => void;
  onDelete: (id: number) => void;
}

type Tab = 'details' | 'history';

export const DetailModal = ({
  obligation,
  payments,
  isOpen,
  onClose,
  onPay,
  onCancel,
  onDelete,
}: DetailModalProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!isOpen || !obligation) return null;

  const categoryLabels: Record<string, string> = {
    subscription: 'Подписка',
    insurance: 'Страховка',
    warranty: 'Гарантия',
    other: 'Другое',
  };

  const statusLabels: Record<string, string> = {
    active: 'Активно',
    cancelled: 'Отменено',
  };

  // Расчет следующей даты после оплаты
  const getNextPaymentDate = () => {
    if (!obligation.recurrence) return null;
    const date = new Date(obligation.next_payment_date);
    switch (obligation.recurrence) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        return null;
    }
    return formatDate(date.toISOString());
  };

  const nextDate = getNextPaymentDate();

  return (
    <>
      {/* Оверлей */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        }}
        onClick={onClose}
      />

      {/* Модальное окно */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 1001,
        }}
      >
        {/* Заголовок */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{obligation.name}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0 8px',
            }}
          >
            ×
          </button>
        </div>

        {/* Вкладки */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
          <button
            onClick={() => setActiveTab('details')}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'details' ? '2px solid #0d6efd' : '2px solid transparent',
              fontWeight: activeTab === 'details' ? '600' : '400',
              color: activeTab === 'details' ? '#0d6efd' : '#666',
            }}
          >
            Детали
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'history' ? '2px solid #0d6efd' : '2px solid transparent',
              fontWeight: activeTab === 'history' ? '600' : '400',
              color: activeTab === 'history' ? '#0d6efd' : '#666',
            }}
          >
            История платежей
          </button>
        </div>

        {/* Контент вкладок */}
        {activeTab === 'details' ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Категория:</strong> {categoryLabels[obligation.category]}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Сумма:</strong> {formatCurrency(obligation.amount, obligation.currency)}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Следующий платеж:</strong> {formatDate(obligation.next_payment_date)}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Статус:</strong> {statusLabels[obligation.status]}
              </div>
              {obligation.recurrence && (
                <div style={{ marginBottom: '12px' }}>
                  <strong>Периодичность:</strong> {obligation.recurrence === 'monthly' ? 'Ежемесячно' : 'Ежегодно'}
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            {obligation.status === 'active' && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowPayDialog(true)}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '10px',
                    backgroundColor: '#198754',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Оплатить
                </button>
                <button
                  onClick={() => onCancel(obligation.id)}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '10px',
                    backgroundColor: '#ffc107',
                    color: 'black',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Отменить
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                История платежей пуста
              </div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{formatDate(payment.paid_at)}</span>
                  <strong>{formatCurrency(payment.amount, payment.currency)}</strong>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Диалог оплаты */}
      {showPayDialog && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            zIndex: 1002,
          }}
        >
          <h3 style={{ marginBottom: '16px' }}>Подтверждение оплаты</h3>
          <p style={{ marginBottom: '12px' }}>
            Сумма: <strong>{formatCurrency(obligation.amount, obligation.currency)}</strong>
          </p>
          {nextDate ? (
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Следующее списание: {nextDate} · {formatCurrency(obligation.amount, obligation.currency)}
            </p>
          ) : (
            <p style={{ marginBottom: '20px', color: '#666' }}>
              После оплаты обязательство будет закрыто
            </p>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setShowPayDialog(false);
                onPay(obligation.id);
              }}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#198754',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Подтвердить
            </button>
            <button
              onClick={() => setShowPayDialog(false)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Диалог удаления */}
      {showDeleteDialog && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            zIndex: 1002,
          }}
        >
          <h3 style={{ marginBottom: '16px' }}>Удаление обязательства</h3>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Вы уверены, что хотите удалить "{obligation.name}"? Это действие нельзя отменить.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setShowDeleteDialog(false);
                onDelete(obligation.id);
              }}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Удалить
            </button>
            <button
              onClick={() => setShowDeleteDialog(false)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  );
};