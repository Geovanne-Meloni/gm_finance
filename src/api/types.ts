export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  monthlySalary: string | null;
}

export interface AllocationRule {
  id: string;
  userId: string;
  label: string;
  percent: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: string;
  currentAmount: string;
  targetMonths: number | null;
  remainingAmount: string;
  jointMonthlyGuardado: string | null;
  estimatedMonthsRemaining: number | null;
}

export interface Split {
  label: string;
  percent: number;
  plannedAmount: string;
  spentAmount: string;
  amount: string;
}

export type RevenueType = 'ACTIVE' | 'PASSIVE';

export interface Summary {
  userId: string;
  yearMonth: string;
  declaredRevenueTotal: string;
  extraRevenueTotal: string;
  extraExpenseTotal: string;
  totalRevenueForSplit: string;
  splits: Split[];
  primaryGoal: SavingsGoal | null;
}

export interface RevenueEntry {
  id: string;
  userId: string;
  createdByUserId: string;
  amount: string;
  yearMonth: string;
  title: string;
  revenueType: RevenueType;
}

export interface ExtraTransaction {
  id: string;
  userId: string;
  createdByUserId: string;
  type: 'REVENUE' | 'EXPENSE';
  amount: string;
  reason: string;
  category: string | null;
  yearMonth: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  deviceId: string;
  user: User;
}
