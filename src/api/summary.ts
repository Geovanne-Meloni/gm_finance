import { fetchApi } from './http';
import { Summary } from './types';

export async function getUserSummary(id: string, yearMonth?: string): Promise<Summary> {
  const query = yearMonth ? `?yearMonth=${yearMonth}` : '';
  return fetchApi<Summary>(`/api/users/${id}/summary${query}`);
}