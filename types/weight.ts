import { UserName } from './meal';

export type WeightEntry = {
  id: string;
  created_at: string;
  measured_on: string; // yyyy-MM-dd
  user_name: UserName;
  weight_kg: number;
};

export type WeightInput = Omit<WeightEntry, 'id' | 'created_at'>;
