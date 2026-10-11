import { subDays } from 'date-fns';
import { dayKey } from './dates';
import { HEALTHY_COMPOSITIONS, Meal, TREAT_COMPOSITIONS, UserName } from '@/types/meal';

export const LATE_HOUR = 21;
export const LOW_HUNGER = 2;

export const isTreat = (meal: Meal) => meal.meal_composition.some((c) => TREAT_COMPOSITIONS.includes(c));
export const isHealthy = (meal: Meal) => meal.meal_composition.some((c) => HEALTHY_COMPOSITIONS.includes(c));
export const isLate = (meal: Meal) => new Date(meal.meal_datetime).getHours() >= LATE_HOUR;
export const isWithoutHunger = (meal: Meal) => meal.hunger_level != null && meal.hunger_level <= LOW_HUNGER;

const percent = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

export type PeriodStats = {
  meals: number;
  controlPercent: number;
  treats: number;
  healthyPercent: number;
  late: number;
  withoutHunger: number;
};

export function periodStats(meals: Meal[]): PeriodStats {
  return {
    meals: meals.length,
    controlPercent: percent(meals.filter((m) => m.satisfied).length, meals.length),
    treats: meals.filter(isTreat).length,
    healthyPercent: percent(meals.filter(isHealthy).length, meals.length),
    late: meals.filter(isLate).length,
    withoutHunger: meals.filter(isWithoutHunger).length,
  };
}

// Pasti di un utente negli ultimi `days` giorni, a partire da `offset` giorni fa
export function mealsInWindow(meals: Meal[], user: UserName, days: number, offset = 0, now = new Date()) {
  const keys = new Set(Array.from({ length: days }, (_, i) => dayKey(subDays(now, offset + i))));
  return meals.filter((m) => m.user_name === user && keys.has(dayKey(m.meal_datetime)));
}

// Un giorno è "in controllo" se ha almeno un pasto e tutti i pasti sono soddisfatti
export function controlStreak(meals: Meal[], user: UserName, now = new Date()): number {
  const byDay = new Map<string, Meal[]>();
  meals
    .filter((m) => m.user_name === user)
    .forEach((m) => {
      const key = dayKey(m.meal_datetime);
      byDay.set(key, [...(byDay.get(key) ?? []), m]);
    });

  // Se oggi non c'è ancora nulla, la serie parte da ieri
  let offset = byDay.has(dayKey(now)) ? 0 : 1;
  let streak = 0;
  for (;;) {
    const dayMeals = byDay.get(dayKey(subDays(now, offset)));
    if (!dayMeals || !dayMeals.every((m) => m.satisfied)) break;
    streak += 1;
    offset += 1;
  }
  return streak;
}

export type Tip = { tone: 'good' | 'warn'; text: string };

// Suggerimenti pratici confrontando l'ultima settimana con quella precedente
export function weeklyTips(current: PeriodStats, previous: PeriodStats): Tip[] {
  if (current.meals === 0) {
    return [{ tone: 'warn', text: 'Nessun pasto registrato negli ultimi 7 giorni: annotare ogni pasto è il primo passo per dimagrire.' }];
  }

  const tips: Tip[] = [];

  if (previous.meals > 0 && current.controlPercent >= previous.controlPercent + 5) {
    tips.push({ tone: 'good', text: `Controllo in crescita: ${previous.controlPercent}% → ${current.controlPercent}% rispetto alla settimana prima.` });
  } else if (previous.meals > 0 && current.controlPercent <= previous.controlPercent - 5) {
    tips.push({ tone: 'warn', text: `Controllo in calo: ${previous.controlPercent}% → ${current.controlPercent}%. Prova a pianificare in anticipo i pasti più difficili.` });
  }

  if (current.treats > previous.treats && current.treats >= 3) {
    tips.push({ tone: 'warn', text: `${current.treats} tra snack e dessert questa settimana (erano ${previous.treats}). Tieni a portata di mano frutta o yogurt come alternativa.` });
  } else if (previous.meals > 0 && current.treats < previous.treats) {
    tips.push({ tone: 'good', text: `Meno snack e dessert: ${current.treats} contro ${previous.treats} della settimana prima.` });
  }

  if (current.healthyPercent < 50) {
    tips.push({ tone: 'warn', text: `Solo il ${current.healthyPercent}% dei pasti contiene frutta o verdura. Riempire metà piatto di verdura aiuta a saziarsi con meno calorie.` });
  } else {
    tips.push({ tone: 'good', text: `Il ${current.healthyPercent}% dei pasti contiene frutta o verdura: ottimo!` });
  }

  if (current.withoutHunger >= 2) {
    tips.push({ tone: 'warn', text: `${current.withoutHunger} pasti con fame bassa (≤ ${LOW_HUNGER}/5). Prima di mangiare chiediti se è fame vera o noia/stress.` });
  }

  if (current.late >= 2) {
    tips.push({ tone: 'warn', text: `${current.late} pasti dopo le ${LATE_HOUR}:00. Anticipare la cena e chiudere la cucina riduce gli spuntini serali.` });
  }

  return tips;
}
