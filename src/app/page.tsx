'use client';

import { useEffect, useState } from 'react';
import { useObligationStore } from '@/store/useObligationStore';
import { 
  getObligations, 
  getUpcoming, 
  getPayments, 
  payObligation, 
  cancelObligation, 
  deleteObligation 
} from '@/services/api';
import { useSSE } from '@/hooks/useSSE';
import { Header } from '@/components/Header/Header';
import { Filters } from '@/components/Filters/Filters';
import { ObligationCard } from '@/components/ObligationCard/ObligationCard';
import { DetailModal } from '@/components/DetailModal/DetailModal';
import { SSEEvent, Obligation, Payment } from '@/types';

export default function Home() {
  const { 
    obligations, upcoming, payments, selectedObligation, filters,
    setObligations, setUpcoming, setSelectedObligation, setPayments,
    addObligation, updateObligation, removeObligation, addPayment,
    setLoading, setError 
  } = useObligationStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exitingId, setExitingId] = useState<number | null>(null);

  // 1. Первоначальная загрузка данных
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [obsData, upcData] = await Promise.all([
          getObligations(),
          getUpcoming()
        ]);
        setObligations(obsData.items);
        setUpcoming(upcData.renewal_alerts);
      } catch (err) {
        setError('Ошибка загрузки данных. Проверьте подключение.');
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setObligations, setUpcoming, setLoading, setError]);

  // 2. Загрузка истории платежей при открытии модального окна
  useEffect(() => {
    if (selectedObligation) {
      getPayments(selectedObligation.id)
        .then(setPayments)
        .catch(err => console.error('Ошибка загрузки платежей:', err));
    }
  }, [selectedObligation, setPayments]);

  // 3. Подключение SSE (Real-time обновления)
  useSSE('/api/events', (event: SSEEvent) => {
  console.log('SSE Event received:', event);
  
  switch (event.type) {
    case 'obligation_created':
      // TypeScript теперь знает, что это Obligation
      addObligation(event.data as Obligation);
      break;
    case 'obligation_updated':
      const updatedObs = event.data as Obligation;
      updateObligation(updatedObs.id, updatedObs);
      break;
    case 'obligation_deleted':
      const deletedObs = event.data as Obligation;
      removeObligation(deletedObs.id);
      if (selectedObligation?.id === deletedObs.id) {
        setIsModalOpen(false);
        setSelectedObligation(null);
      }
      break;
    case 'payment_recorded':
      addPayment(event.data as Payment);
      break;
  }
});

  // --- ОБРАБОТЧИКИ ДЕЙСТВИЙ (Оптимистичные обновления) ---

  const handlePay = async (id: number) => {
    const originalObs = obligations.find(o => o.id === id);
    if (!originalObs) return;

    // 1. Оптимистичное обновление (считаем следующую дату на клиенте)
    const nextDate = new Date(originalObs.next_payment_date);
    if (originalObs.recurrence === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (originalObs.recurrence === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    
    updateObligation(id, { next_payment_date: nextDate.toISOString() });

    // 2. Отправляем запрос на сервер (или в mock)
    try {
      const updated = await payObligation(id);
      // 3. Синхронизируем с ответом сервера
      updateObligation(id, updated);
    } catch (err) {
      console.warn('Ошибка оплаты, выполняем откат:', err);
      // 4. Откат при ошибке
      updateObligation(id, originalObs);
    }
  };

  const handleCancel = async (id: number) => {
    const originalObs = obligations.find(o => o.id === id);
    if (!originalObs) return;

    // Оптимистично меняем статус
    updateObligation(id, { status: 'cancelled' });

    try {
      const updated = await cancelObligation(id);
      updateObligation(id, updated);
    } catch (err) {
      console.warn('Ошибка отмены, выполняем откат:', err);
      updateObligation(id, originalObs);
    }
  };

  const handleDelete = async (id: number) => {
    const originalObs = obligations.find(o => o.id === id);
    
    // 1. Запускаем анимацию и оптимистично удаляем
    setExitingId(id);
    removeObligation(id);

    try {
      await deleteObligation(id);
      // Успех, завершаем анимацию
      setTimeout(() => setExitingId(null), 300);
    } catch (err) {
      console.warn('Ошибка удаления, выполняем откат:', err);
      // 2. Откат: возвращаем обязательство обратно в список
      if (originalObs) {
        addObligation(originalObs);
      }
      setExitingId(null);
    }
  };

  const openModal = (obs: Obligation) => {
    setSelectedObligation(obs);
    setIsModalOpen(true);
  };

  // Фильтрация основного списка
  const filteredObligations = obligations.filter((obs) => {
    const matchesCategory = !filters.category || obs.category === filters.category;
    const matchesSearch = !filters.q || obs.name.toLowerCase().includes(filters.q.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="container">
      <Header />
      <Filters />
      
      {/* Блок "Скоро спишут" */}
      {upcoming.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--color-danger)' }}>
            ⚠️ Скоро спишут (автопродление)
          </h2>
          {upcoming.map((obs) => (
            <ObligationCard 
              key={obs.id} 
              obligation={obs} 
              isUpcoming={true} 
              onCancel={handleCancel}
              onClick={() => openModal(obs)}
              isExiting={exitingId === obs.id}
            />
          ))}
        </section>
      )}

      {/* Основной список */}
      <section>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Все обязательства
        </h2>
        {filteredObligations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            Обязательства не найдены
          </div>
        ) : (
          filteredObligations
            .sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime())
            .map((obs) => (
              <ObligationCard 
                key={obs.id} 
                obligation={obs} 
                onClick={() => openModal(obs)}
                isExiting={exitingId === obs.id}
              />
            ))
        )}
      </section>

      {/* Модальное окно */}
      <DetailModal
        obligation={selectedObligation}
        payments={payments}
        isOpen={isModalOpen}
        onClose={() => { 
          setIsModalOpen(false); 
          setSelectedObligation(null); 
        }}
        onPay={handlePay}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    </main>
  );
}