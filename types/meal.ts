export const MEAL_COMPOSITIONS = ['Verdura', 'Frutta', 'Primo', 'Secondo', 'Snack dolce', 'Snack salato', 'Dessert'] as const;

export type MealComposition = (typeof MEAL_COMPOSITIONS)[number];

// Categorie da limitare per favorire il calo di peso
export const TREAT_COMPOSITIONS: MealComposition[] = ['Snack dolce', 'Snack salato', 'Dessert'];

// Categorie da incoraggiare (ricche di fibre, poco caloriche)
export const HEALTHY_COMPOSITIONS: MealComposition[] = ['Verdura', 'Frutta'];

export const USERS = ['Silvia', 'Nicolò'] as const;

export type UserName = (typeof USERS)[number];

export type Meal = {
  id: string;
  created_at: string;
  meal_datetime: string;
  user_name: UserName;
  description?: string | null;
  meal_composition: MealComposition[];
  satisfied: boolean;
  hunger_level?: number | null;
  notes?: string | null;
};

export type MealInput = Omit<Meal, 'id' | 'created_at'>;
