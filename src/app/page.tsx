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
import { SSEEvent } from '@/types';

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
        console.error(err);
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
        addObligation(event.data as any);
        break;
      case 'obligation_updated':
        updateObligation((event.data as any).id, event.data as any);
        break;
      case 'obligation_deleted':
        removeObligation((event.data as any).id);
        if (selectedObligation?.id === (event.data as any).id) {
          setIsModalOpen(false);
        }
        break;
      case 'payment_recorded':
        addPayment(event.data as any);
        break;
    }
  });

  // --- ОБРАБОТЧИКИ ДЕЙСТВИЙ (Оптимистичные обновления) ---

  const handlePay = async (id: number) => {
    // 1. Находим обязательство для отката в случае ошибки
    const originalObs = obligations.find(o => o.id === id);
    if (!originalObs) return;

    // 2. Оптимистичное обновление (считаем следующую дату на клиенте)
    let nextDate = new Date(originalObs.next_payment_date);
    if (originalObs.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (originalObs.recurrence === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
    
    updateObligation(id, { next_payment_date: nextDate.toISOString() });

    // 3. Отправляем запрос на сервер
    try {
      const updated = await payObligation(id);
      // 4. Синхронизируем с реальными данными с сервера
      updateObligation(id, updated);
    } catch (err) {
      console.error('Ошибка оплаты, откатываем:', err);
      // 5. Откат при ошибке
      updateObligation(id, originalObs);
      alert('Не удалось оплатить. Попробуйте позже.');
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
      console.error('Ошибка отмены, откатываем:', err);
      updateObligation(id, originalObs);
      alert('Не удалось отменить подписку.');
    }
  };

  const handleDelete = async (id: number) => {
    // Запоминаем для анимации
    setExitingId(id);
    
    // Оптимистично удаляем из стора
    removeObligation(id);

    try {
      await deleteObligation(id);
      // Успех, очищаем ID анимации
      setTimeout(() => setExitingId(null), 300);
    } catch (err) {
      console.error('Ошибка удаления, откатываем:', err);
      // При ошибке нам придется перезагрузить список, так как мы его уже удалили из стора
      // Для простоты в пет-проекте можно просто показать алерт, а в идеале - вернуть объект обратно
      alert('Не удалось удалить. Обновите страницу.');
      setExitingId(null);
    }
  };

  const openModal = (obs: any) => {
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

      <DetailModal
        obligation={selectedObligation}
        payments={payments}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedObligation(null); }}
        onPay={handlePay}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    </main>
  );
}