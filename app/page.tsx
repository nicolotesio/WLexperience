"use client";

import { useEffect, useState } from 'react';
import MealForm from '@/components/MealForm';
import MealCard from '@/components/MealCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Meal } from '@/types/meal';

const apiUrl = '/api/meals';

export default function HomePage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMeals();
  }, []);

  async function fetchMeals() {
    setLoading(true);
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      setMeals(data || []);
    } catch (error) {
      console.error('Errore caricamento pasti', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddMeal = async () => {
    await fetchMeals();
    setMessage('Pasto aggiunto con successo!');
    window.setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-10 pb-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Live Blog</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Food Live Blog</h1>
          <p className="max-w-2xl text-slate-600">Piccole scelte, grande costanza. Registra i pasti insieme a Silvia e Nicolò e tieni traccia dei progressi in modo positivo.</p>
        </div>
      </section>

      <MealForm onSuccess={handleAddMeal} />

      {message ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-soft">
          {message}
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Blog dei pasti</h2>
            <p className="text-sm text-slate-500">Ultimi pasti ordinati per data decrescente.</p>
          </div>
          <button
            type="button"
            onClick={fetchMeals}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Aggiorna lista
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : meals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
            Nessun pasto registrato ancora. Aggiungi il primo pasto per iniziare il diario.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
