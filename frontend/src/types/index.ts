export interface Transaction {
  _id?: string;
  id: number;
  date: string;
  amount: number;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending';
  user_id: string;
  user_profile: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface FilterParams {
  category?: string;
  status?: string;
  user_id?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  search?: string;
  sortBy?: 'date' | 'amount' | 'id' | 'category' | 'status' | 'user_id';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatsSummary {
  totalCount: number;
  totalRevenue: number;
  totalExpense: number;
  paidCount: number;
  pendingCount: number;
  paidAmount: number;
  pendingAmount: number;
  netBalance: number;
}

export interface MonthlyTrend {
  month: string;
  monthNumber: number;
  revenue: number;
  expense: number;
  net: number;
  count: number;
}

export interface CategoryBreakdownItem {
  _id: 'Revenue' | 'Expense' | string;
  totalAmount: number;
  count: number;
}

export interface UserBreakdownItem {
  _id: string;
  revenue: number;
  expense: number;
  totalAmount: number;
  count: number;
}

export interface StatsResponse {
  success: boolean;
  summary: StatsSummary;
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdownItem[];
  userBreakdown: UserBreakdownItem[];
}

export type AlertType = 'error' | 'warning' | 'success' | 'info';

export interface AlertChip {
  id: string;
  type: AlertType;
  message: string;
  timestamp: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface CsvExportConfig {
  columns: string[];
  columnAliases: Record<string, string>;
  dateFormat: 'iso' | 'locale';
  formatCurrency: boolean;
  filters: FilterParams;
  scope: 'filtered' | 'all';
}
