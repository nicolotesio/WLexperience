"use client";

import { useMemo, useState } from 'react';
import { addMealClient } from '@/lib/meals';
import { MealInput } from '@/types/meal';

const initialState: MealInput = {
  meal_datetime: new Date().toISOString().slice(0, 16),
  user_name: 'Silvia',
  description: '',
  meal_type: 'Primo',
  satisfied: true,
  hunger_level: undefined,
  notes: '',
};

const mealTypes = ['Primo', 'Secondo', 'Dessert', 'Snack', 'Altro'] as const;

export default function MealForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<MealInput>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isValid = useMemo(() => form.description.trim().length > 0 && form.meal_datetime.trim().length > 0, [form]);

  const handleChange = <K extends keyof MealInput>(field: K, value: MealInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setError('Compila tutti i campi obbligatori prima di inviare.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: MealInput = {
        meal_datetime: new Date(form.meal_datetime).toISOString(),
        user_name: form.user_name,
        description: form.description.trim(),
        meal_type: form.meal_type,
        satisfied: form.satisfied,
        hunger_level: form.hunger_level ? Number(form.hunger_level) : null,
        notes: form.notes?.trim() || null,
      };

      await addMealClient(payload);
      setSuccess('Pasto salvato!');
      setForm(initialState);
      onSuccess();
      window.setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Impossibile salvare il pasto. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm sm:p-8">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Aggiungi un pasto</h2>
          <p className="text-sm text-slate-500">Registra il pasto consumato da Silvia o Nicolò con un tono positivo e chiaro.</p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-700">
              Data e ora
              <input
                type="datetime-local"
                value={form.meal_datetime}
                onChange={(event) => handleChange('meal_datetime', event.target.value)}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-700">
              Utente
              <select
                value={form.user_name}
                onChange={(event) => handleChange('user_name', event.target.value as MealInput['user_name'])}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                <option value="Silvia">Silvia</option>
                <option value="Nicolò">Nicolò</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm text-slate-700">
            Descrizione
            <textarea
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              placeholder="Cosa hai mangiato?"
              rows={4}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm text-slate-700">
              Tipo pasto
              <select
                value={form.meal_type}
                onChange={(event) => handleChange('meal_type', event.target.value as MealInput['meal_type'])}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                {mealTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-700">
              Stato pasto
              <select
                value={form.satisfied ? 'soddisfatto' : 'non-soddisfatto'}
                onChange={(event) => handleChange('satisfied', event.target.value === 'soddisfatto')}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                <option value="soddisfatto">Soddisfatto: ho mangiato in modo equilibrato</option>
                <option value="non-soddisfatto">Non soddisfatto: ho esagerato</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-700">
              Livello fame (opzionale)
              <select
                value={form.hunger_level ?? ''}
                onChange={(event) => handleChange('hunger_level', event.target.value ? Number(event.target.value) : undefined)}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">---</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm text-slate-700">
            Note (opzionale)
            <textarea
              value={form.notes ?? ''}
              onChange={(event) => handleChange('notes', event.target.value)}
              rows={3}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/10 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Salvataggio...' : 'Aggiungi pasto'}
          </button>
        </form>
      </div>
    </section>
  );
}
