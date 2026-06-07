import { fetchApi } from './http';
import { User, AllocationRule } from './types';

export async function getUsers(): Promise<User[]> {
  return fetchApi<User[]>('/api/users');
}

export async function getUser(id: string): Promise<User> {
  return fetchApi<User>(`/api/users/${id}`);
}

export async function getUserAllocationRules(id: string): Promise<AllocationRule[]> {
  return fetchApi<AllocationRule[]>(`/api/users/${id}/allocation-rules`);
}

export async function updateUserAllocationRules(
  id: string,
  rules: { label: string; kind: "EXPENSE" | "SAVINGS"; fixedAmount: number }[]
): Promise<AllocationRule[]> {
  return fetchApi<AllocationRule[]>(`/api/users/${id}/allocation-rules`, {
    method: 'PUT',
    body: JSON.stringify({ rules }),
  });
}

export async function updateUserMonthlySalary(
  id: string,
  monthlySalary: number | null
): Promise<User> {
  return fetchApi<User>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ monthlySalary }),
  });
}
