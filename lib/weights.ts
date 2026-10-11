import { getSupabaseClient, isSupabaseClientConfigured } from './supabaseClient';
import { WeightEntry, WeightInput } from '@/types/weight';

function assertSupabase() {
  if (!isSupabaseClientConfigured()) {
    throw new Error('Supabase URL e anon key devono essere configurati in .env');
  }
}

export async function getWeightsClient(): Promise<WeightEntry[]> {
  assertSupabase();
  const { data, error } = await getSupabaseClient()
    .from('weights')
    .select('*')
    .order('measured_on', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((entry) => ({ ...entry, weight_kg: Number(entry.weight_kg) }));
}

export async function addWeightClient(entry: WeightInput): Promise<WeightEntry> {
  assertSupabase();
  const { data, error } = await getSupabaseClient()
    .from('weights')
    .upsert([entry], { onConflict: 'user_name,measured_on' })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteWeightClient(id: string): Promise<void> {
  assertSupabase();
  const { error } = await getSupabaseClient().from('weights').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
