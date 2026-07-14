'use client';

import { useEffect } from 'react';
import { useObligationStore } from '@/store/useObligationStore';
import { getObligations, getUpcoming } from '@/services/api';
import { Header } from '@/components/Header/Header';
import { Filters } from '@/components/Filters/Filters';
import { ObligationCard } from '@/components/ObligationCard/ObligationCard';

export default function Home() {
  const { obligations, upcoming, setObligations, setUpcoming, filters, setLoading, setError } = useObligationStore();

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
        setError('Ошибка загрузки данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setObligations, setUpcoming, setLoading, setError]);

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
              onCancel={(id) => console.log('Cancel', id)} // Пока заглушка
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
                onClick={() => console.log('Open details', obs.id)} // Пока заглушка
              />
            ))
        )}
      </section>
    </main>
  );
}