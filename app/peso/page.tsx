"use client";

import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LoadingSpinner from '@/components/LoadingSpinner';
import { addWeightClient, deleteWeightClient, getWeightsClient } from '@/lib/weights';
import { USERS, UserName } from '@/types/meal';
import { WeightEntry } from '@/types/weight';

const userColors: Record<UserName, string> = {
  Silvia: '#a855f7',
  Nicolò: '#2563eb',
};

const userAccent: Record<UserName, string> = {
  Silvia: 'text-purple-500',
  Nicolò: 'text-blue-600',
};

const formatKg = (value: number) => `${value.toLocaleString('it-IT', { maximumFractionDigits: 1 })} kg`;

const formatDelta = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toLocaleString('it-IT', { maximumFractionDigits: 1 })} kg`;

const deltaClass = (value: number) => (value < 0 ? 'text-emerald-600' : value > 0 ? 'text-rose-600' : 'text-slate-900');

// La tabella "weights" non esiste ancora su Supabase
const isMissingTable = (err: unknown) => {
  const code = (err as { code?: string })?.code;
  return code === '42P01' || code === 'PGRST205';
};

function userSummary(entries: WeightEntry[]) {
  if (entries.length === 0) return null;
  const first = entries[0];
  const last = entries[entries.length - 1];
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const baseline30 = entries.find((e) => parseISO(e.measured_on) >= monthAgo) ?? last;
  return {
    start: first.weight_kg,
    current: last.weight_kg,
    lastDate: last.measured_on,
    total: last.weight_kg - first.weight_kg,
    last30: last.weight_kg - baseline30.weight_kg,
  };
}

export default function WeightPage() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ user_name: UserName; measured_on: string; weight: string }>({
    user_name: 'Silvia',
    measured_on: '',
    weight: '',
  });

  useEffect(() => {
    setForm((current) => ({ ...current, measured_on: format(new Date(), 'yyyy-MM-dd') }));
    loadEntries();
  }, []);

  async function loadEntries() {
    setLoading(true);
    setError(null);
    try {
      setEntries(await getWeightsClient());
      setNeedsSetup(false);
    } catch (err) {
      if (isMissingTable(err)) {
        setNeedsSetup(true);
      } else {
        setError((err as Error).message || 'Errore durante il caricamento delle pesate.');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const weight = Number(form.weight.replace(',', '.'));
    if (!form.measured_on || !Number.isFinite(weight) || weight < 30 || weight > 300) {
      setError('Inserisci un peso valido (tra 30 e 300 kg).');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await addWeightClient({ user_name: form.user_name, measured_on: form.measured_on, weight_kg: weight });
      setForm((current) => ({ ...current, weight: '' }));
      await loadEntries();
    } catch (err) {
      setError(isMissingTable(err) ? 'Crea prima la tabella "weights" su Supabase (vedi README).' : 'Impossibile salvare la pesata.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWeightClient(id);
      await loadEntries();
    } catch {
      setError('Impossibile eliminare la pesata.');
    }
  };

  const chartData = useMemo(() => {
    const byDay = new Map<string, Record<string, string | number>>();
    entries.forEach((entry) => {
      const row = byDay.get(entry.measured_on) ?? { day: entry.measured_on, name: format(parseISO(entry.measured_on), 'dd/MM') };
      row[entry.user_name] = entry.weight_kg;
      byDay.set(entry.measured_on, row);
    });
    return Array.from(byDay.values()).sort((a, b) => String(a.day).localeCompare(String(b.day)));
  }, [entries]);

  const inputStyle =
    'w-full min-w-0 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100';

  return (
    <div className="space-y-10 pb-10">
      <section className="max-w-3xl space-y-2 px-6 sm:px-8">
        <h2 className="text-3xl font-bold text-slate-900">Andamento del peso</h2>
        <p className="max-w-2xl text-lg text-slate-700">
          Pesati una volta a settimana, sempre alla stessa ora (al mattino, a digiuno): conta la tendenza, non il singolo giorno.
        </p>
      </section>

      {needsSetup ? (
        <div className="mx-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-soft sm:mx-8">
          Per usare questa sezione crea la tabella <code className="font-mono">weights</code> su Supabase con lo SQL indicato nel README.
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-soft sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">Registra il peso</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-4 sm:items-end" onSubmit={handleSubmit}>
          <label className="grid min-w-0 gap-2">
            <span className="text-sm font-semibold text-slate-700">Utente</span>
            <select
              value={form.user_name}
              onChange={(event) => setForm((current) => ({ ...current, user_name: event.target.value as UserName }))}
              className={inputStyle}
            >
              {USERS.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-2">
            <span className="text-sm font-semibold text-slate-700">Data</span>
            <input
              type="date"
              value={form.measured_on}
              onChange={(event) => setForm((current) => ({ ...current, measured_on: event.target.value }))}
              className={`${inputStyle} appearance-none`}
              required
            />
          </label>
          <label className="grid min-w-0 gap-2">
            <span className="text-sm font-semibold text-slate-700">Peso (kg)</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="es. 72,4"
              value={form.weight}
              onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
              className={inputStyle}
              required
            />
          </label>
          <button
            type="submit"
            disabled={saving || needsSetup}
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/10 transition hover:bg-brand-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? 'Salvataggio...' : 'Salva peso'}
          </button>
        </form>
        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-2">
            {USERS.map((user) => {
              const userEntries = entries.filter((e) => e.user_name === user);
              const summary = userSummary(userEntries);
              return (
                <div key={user} className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-soft">
                  <h3 className={`mb-6 text-4xl font-black italic tracking-tighter ${userAccent[user]}`}>{user.toUpperCase()}</h3>
                  {summary ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Peso attuale</p>
                        <p className="text-3xl font-bold text-slate-900">{formatKg(summary.current)}</p>
                        <p className="text-xs text-slate-500">{format(parseISO(summary.lastDate), 'dd/MM/yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Peso iniziale</p>
                        <p className="text-3xl font-bold text-slate-900">{formatKg(summary.start)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Variazione totale</p>
                        <p className={`text-3xl font-bold ${deltaClass(summary.total)}`}>{formatDelta(summary.total)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Ultimi 30 giorni</p>
                        <p className={`text-3xl font-bold ${deltaClass(summary.last30)}`}>{formatDelta(summary.last30)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">Nessuna pesata registrata.</p>
                  )}
                  {userEntries.length > 0 ? (
                    <ul className="mt-6 divide-y divide-slate-100 border-t border-slate-100 text-sm">
                      {userEntries
                        .slice(-5)
                        .reverse()
                        .map((entry) => (
                          <li key={entry.id} className="flex items-center justify-between py-2">
                            <span className="text-slate-500">{format(parseISO(entry.measured_on), 'dd/MM/yyyy')}</span>
                            <span className="font-semibold text-slate-900">{formatKg(entry.weight_kg)}</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(entry.id)}
                              className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                            >
                              Elimina
                            </button>
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </section>

          {chartData.length > 1 ? (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Curva del peso</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value: number) => formatKg(value)} />
                    {USERS.map((user) => (
                      <Line
                        key={user}
                        type="monotone"
                        dataKey={user}
                        stroke={userColors[user]}
                        strokeWidth={4}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
