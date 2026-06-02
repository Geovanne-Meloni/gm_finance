import { fetchApi } from './http';
import { RevenueEntry, ExtraTransaction, RevenueType } from './types';

export async function createRevenueEntry(data: {
  userId: string;
  amount: number;
  yearMonth: string;
  createdByUserId: string;
  title: string;
  revenueType: RevenueType;
}): Promise<RevenueEntry> {
  return fetchApi<RevenueEntry>('/api/revenue-entries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createExtraTransaction(data: {
  userId: string;
  type: 'REVENUE' | 'EXPENSE';
  amount: number;
  reason: string;
  category?: string;
  createdByUserId?: string;
  yearMonth?: string;
}): Promise<ExtraTransaction> {
  return fetchApi<ExtraTransaction>('/api/extra-transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
