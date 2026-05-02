"use client";

import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Meal } from '@/types/meal';

const colors = {
  first: '#6366f1',
  second: '#22c55e',
  dessert: '#f472b6',
  snack: '#fb923c',
  other: '#a3a3ff',
};

const buildSummary = (meals: Meal[]) => {
  const users = ['Silvia', 'Nicolò'] as const;
  const metrics = users.map((user) => {
    const userMeals = meals.filter((meal) => meal.user_name === user);
    const total = userMeals.length;
    const notSatisfied = userMeals.filter((meal) => !meal.satisfied).length;
    const satisfiedPercent = total ? Math.round(((total - notSatisfied) / total) * 100) : 0;
    return {
      user,
      total,
      notSatisfied,
      satisfiedPercent,
    };
  });

  const barData = metrics.map((item) => ({
    name: item.user,
    'Pasti non soddisfacenti': item.notSatisfied,
  }));

  const typeCounts = meals.reduce<Record<string, number>>((acc, meal) => {
    acc[meal.meal_type] = (acc[meal.meal_type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(typeCounts).map(([type, value]) => ({ name: type, value }));

  const weeklyData = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(new Date(), 6 - index);
    const dayKey = format(date, 'yyyy-MM-dd');
    const count = meals.filter(
      (meal) => !meal.satisfied && format(new Date(meal.meal_datetime), 'yyyy-MM-dd') === dayKey,
    ).length;
    return { name: format(date, 'dd/MM'), 'Pasti non soddisfacenti': count };
  });

  return { metrics, barData, pieData, weeklyData };
};

export default function ReportPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMeals() {
      setLoading(true);
      try {
        const response = await fetch('/api/meals');
        const data = await response.json();
        setMeals(data || []);
      } catch (error) {
        console.error('Errore caricamento resoconto', error);
      } finally {
        setLoading(false);
      }
    }
    loadMeals();
  }, []);

  const { metrics, barData, pieData, weeklyData } = useMemo(() => buildSummary(meals), [meals]);

  return (
    <div className="space-y-10 pb-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Resoconto</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Dashboard alimentare</h1>
          <p className="max-w-2xl text-slate-600">Misura lo stato d’animo alimentare e il progresso settimanale con un report chiaro e positivo.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {metrics.map((item) => (
          <div key={item.user} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{item.user}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{item.total}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-[0.75rem] font-semibold ${item.user === 'Silvia' ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700'}`}>
                Pasti totali
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Non soddisfacenti: <span className="font-semibold text-slate-900">{item.notSatisfied}</span></p>
              <p>Percentuale soddisfazione: <span className="font-semibold text-slate-900">{item.satisfiedPercent}%</span></p>
            </div>
          </div>
        ))}
      </section>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-soft">Caricamento dei dati...</div>
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Confronto pasti non soddisfacenti</h2>
                  <p className="text-sm text-slate-500">Silvia vs Nicolò</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="Pasti non soddisfacenti" fill={colors.first} radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Andamento settimanale</h2>
                  <p className="text-sm text-slate-500">Pasti non soddisfacenti negli ultimi 7 giorni</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="Pasti non soddisfacenti" stroke={colors.second} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Distribuzione per tipo pasto</h2>
              <p className="text-sm text-slate-500">Vedi quali categorie sono state più frequenti.</p>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={110} paddingAngle={4}>
                    {pieData.map((entry) => {
                      const color =
                        entry.name === 'Primo'
                          ? colors.first
                          : entry.name === 'Secondo'
                          ? colors.second
                          : entry.name === 'Dessert'
                          ? colors.dessert
                          : entry.name === 'Snack'
                          ? colors.snack
                          : colors.other;
                      return <Cell key={entry.name} fill={color} />;
                    })}
                  </Pie>
                  <Legend verticalAlign="bottom" height={50} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
