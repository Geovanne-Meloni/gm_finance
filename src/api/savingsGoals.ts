import { fetchApi } from './http';
import { SavingsGoal } from './types';

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  return fetchApi<SavingsGoal[]>('/api/savings-goals');
}

export async function createSavingsGoal(data: {
  title: string;
  targetAmount: number;
  targetMonths?: number | null;
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
    targetMonths?: number | null;
  }
): Promise<SavingsGoal> {
  return fetchApi<SavingsGoal>(`/api/savings-goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function moveSavingsGoalBalance(
  id: string,
  data: {
    amount: number;
    direction: 'DEPOSIT' | 'WITHDRAW';
  }
): Promise<SavingsGoal> {
  return fetchApi<SavingsGoal>(`/api/savings-goals/${id}/movements`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
