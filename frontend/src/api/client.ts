import type { FilterParams, PaginationMeta, StatsResponse, Transaction, User, CsvExportConfig } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const getHeaders = (isJson: boolean = true): HeadersInit => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.message || 'Login failed', res.status);
    }

    return {
      token: data.token,
      user: data.user,
    };
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.message || 'Failed to fetch user session', res.status);
    }
    return data.user;
  },

  // Transactions
  async getTransactions(params: FilterParams): Promise<{ data: Transaction[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        query.append(key, String(val));
      }
    });

    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`, {
      headers: getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.message || 'Failed to fetch transactions', res.status);
    }

    return {
      data: data.data,
      pagination: data.pagination,
    };
  },

  // Stats / Aggregations
  async getStats(params: FilterParams): Promise<StatsResponse> {
    const query = new URLSearchParams();

    // Include filters in stats query
    ['category', 'status', 'user_id', 'startDate', 'endDate', 'minAmount', 'maxAmount', 'search'].forEach((key) => {
      const val = (params as any)[key];
      if (val !== undefined && val !== '' && val !== null) {
        query.append(key, String(val));
      }
    });

    const res = await fetch(`${API_BASE}/transactions/stats?${query.toString()}`, {
      headers: getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.message || 'Failed to calculate analytics stats', res.status);
    }

    return data;
  },

  // CSV Export with Direct Browser Download
  async exportCsv(config: CsvExportConfig): Promise<{ rowCount?: number; filename: string }> {
    const res = await fetch(`${API_BASE}/transactions/export-csv`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config),
    });

    if (!res.ok) {
      let errorMsg = 'Failed to export CSV';
      try {
        const errJson = await res.json();
        errorMsg = errJson.message || errorMsg;
      } catch {
        // ignore parse error
      }
      throw new ApiError(errorMsg, res.status);
    }

    // Extract filename from header if present
    let filename = `financial_transactions_${Date.now()}.csv`;
    const disposition = res.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { filename };
  },
};
