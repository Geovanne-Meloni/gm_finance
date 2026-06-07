import { fetchApi } from "./http";
import {
  RevenueEntry,
  ExtraTransaction,
  RevenueType,
  RecurringIncome,
} from "./types";

export async function createRevenueEntry(data: {
  userId: string;
  amount: number;
  yearMonth: string;
  createdByUserId: string;
  title: string;
  revenueType: RevenueType;
}): Promise<RevenueEntry> {
  return fetchApi<RevenueEntry>("/api/revenue-entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createExtraTransaction(data: {
  userId: string;
  type: "REVENUE" | "EXPENSE";
  amount: number;
  reason: string;
  category?: string;
  createdByUserId?: string;
  yearMonth?: string;
}): Promise<ExtraTransaction> {
  return fetchApi<ExtraTransaction>("/api/extra-transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRecurringIncomes(
  userId: string,
): Promise<RecurringIncome[]> {
  return fetchApi<RecurringIncome[]>(
    `/api/recurring-incomes?userId=${encodeURIComponent(userId)}`,
  );
}

export async function cancelRecurringIncome(
  id: string,
): Promise<RecurringIncome> {
  return fetchApi<RecurringIncome>(`/api/recurring-incomes/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function getRevenueEntries(
  userId: string,
  yearMonth?: string,
): Promise<RevenueEntry[]> {
  const query = yearMonth ? `&yearMonth=${yearMonth}` : "";
  return fetchApi<RevenueEntry[]>(
    `/api/revenue-entries?userId=${encodeURIComponent(userId)}${query}`,
  );
}

export async function getExtraTransactions(
  userId: string,
  yearMonth?: string,
): Promise<ExtraTransaction[]> {
  const query = yearMonth ? `&yearMonth=${yearMonth}` : "";
  return fetchApi<ExtraTransaction[]>(
    `/api/extra-transactions?userId=${encodeURIComponent(userId)}${query}`,
  );
}
