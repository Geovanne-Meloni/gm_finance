import { fetchApi } from './http';
import { SavingsGoal } from './types';

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  return fetchApi<SavingsGoal[]>('/api/savings-goals');
}

export async function createSavingsGoal(data: {
  title: string;
  targetAmount: number;
  targetMonths: number;
  currentAmount?: number;
}): Promise<SavingsGoal> {
  return fetchApi<SavingsGoal>('/api/savings-goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSavingsGoal(
  id: string,
  data: {
    title?: string;
    targetAmount?: number;
    currentAmount?: number;
    targetMonths?: number;
  }
): Promise<SavingsGoal> {
  return fetchApi<SavingsGoal>(`/api/savings-goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
