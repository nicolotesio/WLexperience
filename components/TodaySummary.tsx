import { Meal, USERS } from '@/types/meal';
import { controlStreak, isHealthy, isTreat, mealsInWindow, periodStats } from '@/lib/insights';

const userAccent: Record<string, string> = {
  Silvia: 'text-purple-500',
  Nicolò: 'text-blue-600',
};

export default function TodaySummary({ meals }: { meals: Meal[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {USERS.map((user) => {
        const today = mealsInWindow(meals, user, 1);
        const week = periodStats(mealsInWindow(meals, user, 7));
        const streak = controlStreak(meals, user);
        const treatsToday = today.filter(isTreat).length;
        const healthyToday = today.filter(isHealthy).length;

        const stats = [
          { label: 'Pasti oggi', value: today.length },
          { label: 'Frutta/verdura oggi', value: healthyToday },
          { label: 'Snack e dessert oggi', value: treatsToday, warn: treatsToday >= 2 },
          { label: 'Controllo 7 giorni', value: `${week.controlPercent}%` },
        ];

        return (
          <div key={user} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h3 className={`text-xl font-black uppercase tracking-tight ${userAccent[user]}`}>{user}</h3>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  streak > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
                title="Giorni consecutivi in cui tutti i pasti sono stati soddisfacenti"
              >
                {streak > 0 ? `🔥 ${streak} ${streak === 1 ? 'giorno' : 'giorni'} in controllo` : 'Nuova serie da iniziare'}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-slate-50 px-3 py-2">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</dt>
                  <dd className={`text-2xl font-bold ${stat.warn ? 'text-rose-600' : 'text-slate-900'}`}>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </section>
  );
}
