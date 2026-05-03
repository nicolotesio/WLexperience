"use client";

import { useEffect, useMemo, useState } from 'react';
import { updateMealClient } from '@/lib/meals';
import { Meal, MealInput } from '@/types/meal';

const compositionOptions = ['Snack dolce', 'Snack salato', 'Primo', 'Secondo', 'Dessert', 'Frutta'] as const;

type CompositionOption = (typeof compositionOptions)[number];

type EditMealModalProps = {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditMealModal({ meal, isOpen, onClose, onSuccess }: EditMealModalProps) {
  const [form, setForm] = useState<MealInput>({
    meal_datetime: '',
    user_name: 'Silvia',
    description: '',
    meal_composition: [],
    satisfied: true,
    hunger_level: 3,
    notes: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (meal) {
      setForm({
        meal_datetime: new Date(meal.meal_datetime).toISOString().slice(0, 16),
        user_name: meal.user_name,
        description: meal.description || '',
        meal_composition: meal.meal_composition,
        satisfied: meal.satisfied,
        hunger_level: meal.hunger_level || 3,
        notes: null,
      });
    }
  }, [meal]);

  const isValid = useMemo(() => {
    const hasContext = (form.description?.trim().length ?? 0) > 0 || form.meal_composition.length > 0;
    return form.meal_datetime.trim().length > 0 && hasContext;
  }, [form]);

  const handleChange = <K extends keyof MealInput>(field: K, value: MealInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleComposition = (option: CompositionOption) => {
    const next = form.meal_composition.includes(option)
      ? form.meal_composition.filter((item) => item !== option)
      : [...form.meal_composition, option];

    setForm((current) => ({ ...current, meal_composition: next }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || !meal) {
      setError('Inserisci una descrizione o seleziona la composizione del pasto');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updates: Partial<MealInput> = {
        meal_datetime: new Date(form.meal_datetime).toISOString(),
        user_name: form.user_name,
        description: form.description?.trim() || null,
        meal_composition: form.meal_composition,
        satisfied: form.satisfied,
        hunger_level: Number(form.hunger_level),
        notes: null,
      };

      await updateMealClient(meal.id, updates);
      setSuccess('Pasto aggiornato!');
      onSuccess();
      window.setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err) {
      setError('Impossibile aggiornare il pasto. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const labelStyle = "text-sm font-semibold text-slate-700";
  const inputStyle = "w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 box-border";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Modifica pasto</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              ✕
            </button>
          </div>

          <form className="grid gap-6 w-full max-w-full overflow-hidden" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 min-w-0">
                <span className={labelStyle}>Data e ora</span>
                <input
                  type="datetime-local"
                  value={form.meal_datetime}
                  onChange={(event) => handleChange('meal_datetime', event.target.value)}
                  className={inputStyle}
                  required
                />
              </label>

              <label className="grid gap-2 min-w-0">
                <span className={labelStyle}>Utente</span>
                <select
                  value={form.user_name}
                  onChange={(event) => handleChange('user_name', event.target.value as MealInput['user_name'])}
                  className={inputStyle}
                >
                  <option value="Silvia">Silvia</option>
                  <option value="Nicolò">Nicolò</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3">
              <span className={labelStyle}>Composizione pasto</span>
              <div className="flex flex-wrap gap-2">
                {compositionOptions.map((option) => {
                  const isSelected = form.meal_composition.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleComposition(option)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className={labelStyle}>Controllo</span>
                <select
                  value={form.satisfied ? 'soddisfatto' : 'non-soddisfatto'}
                  onChange={(event) => handleChange('satisfied', event.target.value === 'soddisfatto')}
                  className={inputStyle}
                >
                  <option value="soddisfatto">Soddisfatto</option>
                  <option value="non-soddisfatto">Non soddisfatto</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className={labelStyle}>Livello fame</span>
                <select
                  value={form.hunger_level ?? ''}
                  onChange={(event) => handleChange('hunger_level', event.target.value ? Number(event.target.value) : undefined)}
                  className={inputStyle}
                  required
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value} {value === 1 ? '(Basso)' : value === 5 ? '(Alto)' : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2">
              <span className={labelStyle}>Descrizione e note</span>
              <textarea
                value={form.description || ''}
                onChange={(event) => handleChange('description', event.target.value)}
                placeholder="Cosa hai mangiato?"
                rows={3}
                className={`${inputStyle} resize-none`}
              />
            </label>

            {error ? <p className="text-sm text-rose-600 font-medium">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-700 font-medium">{success}</p> : null}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/10 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 active:scale-95"
              >
                {loading ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}