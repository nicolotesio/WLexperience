"use client";

import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Meal } from '@/types/meal';

const colors = {
  primo: '#6366f1',
  secondo: '#22c55e',
  dessert: '#f472b6',
  snackDolce: '#fb923c',
  snackSalato: '#fbbf24',
  frutta: '#34d399',
  other: '#a3a3ff',
  nicolo: '#2563eb', 
  silvia: '#a855f7', 
};

const getCategoryColor = (name: string) => {
  const category = name.toLowerCase();
  if (category.includes('primo')) return colors.primo;
  if (category.includes('secondo')) return colors.secondo;
  if (category.includes('dessert')) return colors.dessert;
  if (category.includes('dolce')) return colors.snackDolce;
  if (category.includes('salato')) return colors.snackSalato;
  if (category.includes('frutta')) return colors.frutta;
  return colors.other;
};

// Funzione per renderizzare la percentuale sul grafico
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const buildSummary = (meals: Meal[]) => {
  const users = ['Silvia', 'Nicolò'] as const;
  const uniqueDays = new Set(meals.map(m => format(new Date(m.meal_datetime), 'yyyy-MM-dd'))).size || 1;

  const metrics = users.map((user) => {
    const userMeals = meals.filter((meal) => meal.user_name === user);
    const total = userMeals.length;
    const notSatisfied = userMeals.filter((meal) => !meal.satisfied).length;
    const satisfiedPercent = total ? Math.round(((total - notSatisfied) / total) * 100) : 0;
    const avgHunger = total ? (userMeals.reduce((acc, m) => acc + (m.hunger_level || 0), 0) / total).toFixed(1) : 0;
    const dailyAvg = (total / uniqueDays).toFixed(1);

    const typeCounts = userMeals.reduce<Record<string, number>>((acc, meal) => {
      meal.meal_composition.forEach((category) => {
        acc[category] = (acc[category] || 0) + 1;
      });
      return acc;
    }, {});
    const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    return { user, total, notSatisfied, satisfiedPercent, dailyAvg, avgHunger, pieData };
  });

  const monthlyTrend = Array.from({ length: 30 }).map((_, index) => {
    const date = subDays(new Date(), 29 - index);
    const dayStr = format(date, 'yyyy-MM-dd');
    
    const getControlForUser = (userName: string) => {
      const dayMeals = meals.filter(m => m.user_name === userName && format(new Date(m.meal_datetime), 'yyyy-MM-dd') === dayStr);
      if (dayMeals.length === 0) return null;
      const satisfied = dayMeals.filter(m => m.satisfied).length;
      return Math.round((satisfied / dayMeals.length) * 100);
    };

    return {
      name: format(date, 'dd/MM'),
      'Controllo Silvia': getControlForUser('Silvia'),
      'Controllo Nicolò': getControlForUser('Nicolò'),
    };
  });

  return { metrics, monthlyTrend };
};

export default function ReportPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeals() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/meals');
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Errore caricamento.');
        setMeals(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadMeals();
  }, []);

  const { metrics, monthlyTrend } = useMemo(() => buildSummary(meals), [meals]);

  return (
    <div className="space-y-10 pb-10">
      <section className="flex flex-col gap-4 px-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Resoconto alimentare</h2>
          <p className="max-w-2xl text-lg text-slate-700 font-medium">Un resoconto dei pasti consumati e dei progressi alimentari.</p>
        </div>
        <button onClick={() => window.location.reload()} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Aggiorna dati
        </button>
      </section>

      {error && <div className="mx-6 sm:mx-8 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900 shadow-soft">{error}</div>}

      <section className="grid gap-6 lg:grid-cols-2">
        {metrics.map((item) => (
          <div key={item.user} className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-soft">
            <h3 className={`mb-8 text-4xl font-black italic tracking-tighter ${item.user === 'Silvia' ? 'text-purple-500' : 'text-blue-600'}`}>
              {item.user.toUpperCase()}
            </h3>
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pasti totali</p>
                  <p className="text-3xl font-bold text-slate-900">{item.total}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pasti giornalieri</p>
                  <p className="text-3xl font-bold text-slate-900">{item.dailyAvg}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Controllo (% soddisfatti)</p>
                  <p className="text-3xl font-bold text-slate-900">{item.satisfiedPercent}%</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Livello fame (media)</p>
                  <p className="text-3xl font-bold text-slate-900">{item.avgHunger}</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Composizione pasto</p>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={item.pieData} 
                        dataKey="value" 
                        nameKey="name" 
                        innerRadius={40} 
                        outerRadius={80} 
                        paddingAngle={2}
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {item.pieData.map((entry) => (
                          <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                  {item.pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getCategoryColor(entry.name) }}></span>
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Trend controllo</h2>
          <p className="text-lg text-slate-700 font-medium">Trend % controllo giornaliero (ultimo mese)</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="Controllo Silvia" stroke={colors.silvia} strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} connectNulls />
              <Line type="monotone" dataKey="Controllo Nicolò" stroke={colors.nicolo} strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex justify-center gap-8 text-sm font-bold">
          <div className="flex items-center gap-2.5"><span className="h-3 w-3 rounded-full bg-purple-500"></span> SILVIA</div>
          <div className="flex items-center gap-2.5"><span className="h-3 w-3 rounded-full bg-blue-600"></span> NICOLÒ</div>
        </div>
      </section>
    </div>
  );
}