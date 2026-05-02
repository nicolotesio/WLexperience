import { getSupabaseClient, isSupabaseClientConfigured } from './supabaseClient';
import { getSupabaseServer, isSupabaseServerConfigured } from './supabaseServer';
import { Meal, MealInput } from '@/types/meal';

function assertSupabase() {
  if (!isSupabaseClientConfigured() || !isSupabaseServerConfigured()) {
    throw new Error('Supabase URL e anon key devono essere configurati in .env');
  }
}

export async function getMealsServer(): Promise<Meal[]> {
  assertSupabase();
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from('meals')
    .select('*')
    .order('meal_datetime', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function addMealServer(meal: MealInput): Promise<Meal> {
  assertSupabase();
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer.from('meals').insert([meal]).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getMealsClient(): Promise<Meal[]> {
  assertSupabase();
  const supabaseClient = getSupabaseClient();
  const { data, error } = await supabaseClient
    .from('meals')
    .select('*')
    .order('meal_datetime', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function addMealClient(meal: MealInput): Promise<Meal> {
  assertSupabase();
  const supabaseClient = getSupabaseClient();
  const { data, error } = await supabaseClient.from('meals').insert([meal]).select().single();

  if (error) {
    throw error;
  }

  return data;
}
