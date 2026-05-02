export type MealType = 'Primo' | 'Secondo' | 'Dessert' | 'Snack' | 'Altro';

export type Meal = {
  id: string;
  created_at: string;
  meal_datetime: string;
  user_name: 'Silvia' | 'Nicolò';
  description: string;
  meal_type: MealType;
  satisfied: boolean;
  hunger_level?: number | null;
  notes?: string | null;
};

export type MealInput = Omit<Meal, 'id' | 'created_at'>;
