"use client";

import { useEffect, useState } from 'react';
import MealForm from '@/components/MealForm';
import MealCard from '@/components/MealCard';
import EditMealModal from '@/components/EditMealModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Meal } from '@/types/meal';
import { deleteMealClient } from '@/lib/meals';

const apiUrl = '/api/meals';

export default function HomePage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<Meal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, []);

  async function fetchMeals() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl);
      const data = (await response.json()) as any;

      if (!response.ok) {
        throw new Error(data?.error || 'Errore durante il caricamento dei pasti.');
      }

      if (!Array.isArray(data)) {
        throw new Error('Risposta non valida dal server.');
      }

      setMeals(data);
    } catch (error) {
      console.error('Errore caricamento pasti', error);
      setError((error as Error).message);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  const handleAddMeal = async () => {
    await fetchMeals();
    setMessage('Pasto aggiunto con successo!');
    window.setTimeout(() => setMessage(null), 3000);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
  };

  const handleEditSuccess = async () => {
    await fetchMeals();
    setMessage('Pasto aggiornato con successo!');
    window.setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteMeal = (meal: Meal) => {
    setDeletingMeal(meal);
  };

  const confirmDeleteMeal = async () => {
    if (!deletingMeal) return;

    setDeleteLoading(true);
    setError(null);

    try {
      await deleteMealClient(deletingMeal.id);
      await fetchMeals();
      setMessage('Pasto eliminato con successo!');
      setDeletingMeal(null);
      window.setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Impossibile eliminare il pasto. Riprova più tardi.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-semibold text-slate-600">Live blog dei pasti</h2>
          <p className="max-w-2xl text-slate-600">Piccole scelte, grande costanza. Registra i tuoi pasti e tieni traccia dei progressi.</p>
        </div>
      </section>

      <MealForm onSuccess={handleAddMeal} />

      {message ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-soft">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900 shadow-soft">
          {error}
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Blog dei pasti</h1>
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
              <MealCard key={meal.id} meal={meal} onEdit={handleEditMeal} onDelete={handleDeleteMeal} />
            ))}
          </div>
        )}
      </section>

      <EditMealModal
        meal={editingMeal}
        isOpen={editingMeal !== null}
        onClose={() => setEditingMeal(null)}
        onSuccess={handleEditSuccess}
      />

      {deletingMeal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Conferma eliminazione</h3>
              <p className="text-sm text-slate-600">
                Sei sicuro di voler eliminare questo pasto? L'azione non può essere annullata.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingMeal(null)}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteMeal}
                  disabled={deleteLoading}
                  className="flex-1 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/10 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {deleteLoading ? 'Eliminazione...' : 'Elimina'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
