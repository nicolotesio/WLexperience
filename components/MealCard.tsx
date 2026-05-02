import { Meal } from '@/types/meal';

const userStyles: Record<string, string> = {
  Silvia: 'bg-violet-100 text-violet-800',
  Nicolò: 'bg-teal-100 text-teal-800',
};

type MealCardProps = {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
};

export default function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  const satisfiedLabel = meal.satisfied ? 'Soddisfatto' : 'Non soddisfatto';
  const satisfactionClass = meal.satisfied ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100';

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${userStyles[meal.user_name] || 'bg-slate-100 text-slate-800'}`}>
          {meal.user_name}
        </span>
        <time className="text-sm text-slate-500">{new Date(meal.meal_datetime).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })}</time>
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {meal.meal_composition.map((type) => (
            <span key={type} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {type}
            </span>
          ))}
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${satisfactionClass}`}>{satisfiedLabel}</span>
          {meal.hunger_level ? <span className="rounded-full bg-slate-100 px-3 py-1">Fame {meal.hunger_level}/5</span> : null}
        </div>
        <p className="text-sm leading-6 text-slate-700">{meal.description}</p>
        {meal.notes ? (
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">Note: {meal.notes}</div>
        ) : null}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(meal)}
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
        >
          Modifica
        </button>
        <button
          type="button"
          onClick={() => onDelete(meal)}
          className="flex-1 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-100"
        >
          Elimina
        </button>
      </div>
    </article>
  );
}
