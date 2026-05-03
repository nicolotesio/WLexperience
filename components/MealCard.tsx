import { Meal } from '@/types/meal';

const userStyles: Record<string, string> = {
  Silvia: 'bg-violet-100 text-violet-900 border-violet-200',
  Nicolò: 'bg-blue-100 text-blue-900 border-blue-200',
};

// Funzione per gestire la scala colore della fame (1 Verde -> 5 Rosso)
const getHungerStyles = (level: number) => {
  const styles: Record<number, string> = {
    1: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    2: 'bg-green-100 text-green-800 border-green-200',
    3: 'bg-amber-100 text-amber-800 border-amber-200',
    4: 'bg-orange-100 text-orange-800 border-orange-200',
    5: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return styles[level] || 'bg-slate-100 text-slate-800';
};

type MealCardProps = {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
};

export default function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  const satisfiedLabel = meal.satisfied ? 'Soddisfatto' : 'Non soddisfatto';
  const satisfactionClass = meal.satisfied 
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
    : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5">
      {/* Intestazione: Nome (più grande) e Data */}
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-full px-5 py-2 text-base font-black uppercase tracking-wide border shadow-sm ${userStyles[meal.user_name] || 'bg-slate-100 text-slate-800'}`}>
          {meal.user_name}
        </span>
        <time className="text-sm font-medium text-slate-500">
          {new Date(meal.meal_datetime).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })}
        </time>
      </div>

      <div className="mt-5 flex-grow space-y-4">
        {/* 1. Composizione del pasto (se presente) */}
        {meal.meal_composition.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {meal.meal_composition.map((type) => (
              <span key={type} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-100">
                {type}
              </span>
            ))}
          </div>
        )}

        {/* 2. Descrizione (se presente) */}
        {meal.description && (
          <p className="text-sm leading-6 text-slate-700 font-medium">
            {meal.description}
          </p>
        )}

        {/* 3. Status e Fame (Sempre a capo) */}
        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold border ${satisfactionClass}`}>
              {satisfiedLabel}
            </span>
            {meal.hunger_level && (
              <span className={`rounded-full px-3 py-1 text-xs font-bold border ${getHungerStyles(meal.hunger_level)}`}>
                Fame {meal.hunger_level}/5
              </span>
            )}
          </div>
        </div>
        
        {/* Note (se presenti) */}
        {meal.notes && (
          <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 italic">
            Note: {meal.notes}
          </div>
        )}
      </div>

      {/* Tasti azione in fondo a destra */}
      <div className="mt-auto pt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit(meal)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
        >
          Modifica
        </button>
        <button
          type="button"
          onClick={() => onDelete(meal)}
          className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95"
        >
          Elimina
        </button>
      </div>
    </article>
  );
}