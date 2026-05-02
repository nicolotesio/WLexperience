export type MealComposition = 'Snack dolce' | 'Snack salato' | 'Primo' | 'Secondo' | 'Dessert' | 'Frutta';

export type Meal = {
  id: string;
  created_at: string;
  meal_datetime: string;
  user_name: 'Silvia' | 'Nicolò';
  description?: string | null;
  meal_composition: MealComposition[];
  satisfied: boolean;
  hunger_level?: number | null;
  notes?: string | null;
};

export type MealInput = Omit<Meal, 'id' | 'created_at'>;
