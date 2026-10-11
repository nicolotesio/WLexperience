import { format } from 'date-fns';

// Valore per <input type="datetime-local"> nell'ora locale (toISOString restituirebbe UTC)
export function toLocalInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function dayKey(date: Date | string): string {
  return format(typeof date === 'string' ? new Date(date) : date, 'yyyy-MM-dd');
}
