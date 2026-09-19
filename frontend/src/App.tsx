import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider, useAlerts } from './context/AlertContext';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { ChartsSection } from './components/ChartsSection';
import { FilterBar } from './components/FilterBar';
import { TransactionTable } from './components/TransactionTable';
import { CsvExportModal } from './components/CsvExportModal';
import { AlertChipsTray } from './components/AlertChipsTray';
import type { FilterParams, PaginationMeta, StatsSummary, MonthlyTrend, CategoryBreakdownItem, UserBreakdownItem, Transaction } from './types';
import { api } from './api/client';

const initialFilters: FilterParams = {
  category: 'All',
  status: 'All',
  user_id: 'All',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  search: '',
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
};

const DashboardContent: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showAlert } = useAlerts();

  // Dashboard state
  const [filters, setFilters] = useState<FilterParams>(initialFilters);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [userBreakdown, setUserBreakdown] = useState<UserBreakdownItem[]>([]);

  const [loadingTx, setLoadingTx] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Fetch transactions based on filters
  const fetchTransactions = useCallback(async (currentFilters: FilterParams) => {
    setLoadingTx(true);
    try {
      const res = await api.getTransactions(currentFilters);
      setTransactions(res.data);
      setPagination(res.pagination);

      if (res.data.length === 0 && (currentFilters.search || currentFilters.category !== 'All' || currentFilters.status !== 'All')) {
        showAlert('warning', 'No transactions found matching your filter criteria.', {
          actionLabel: 'Reset Filters',
          onAction: () => setFilters(initialFilters),
        });
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to load transaction records', {
        actionLabel: 'Retry',
        onAction: () => fetchTransactions(currentFilters),
      });
    } finally {
      setLoadingTx(false);
    }
  }, [showAlert]);

  // Fetch analytics stats based on filters
  const fetchStats = useCallback(async (currentFilters: FilterParams) => {
    setLoadingStats(true);
    try {
      const stats = await api.getStats(currentFilters);
      setSummary(stats.summary);
      setMonthlyTrends(stats.monthlyTrends);
      setCategoryBreakdown(stats.categoryBreakdown);
      setUserBreakdown(stats.userBreakdown);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Trigger data fetching when authenticated and filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions(filters);
      fetchStats(filters);
    }
  }, [isAuthenticated, filters, fetchTransactions, fetchStats]);

  const handleFilterChange = (newFilters: Partial<FilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    showAlert('info', 'All filters have been reset to defaults.');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTransactions(filters), fetchStats(filters)]);
    setIsRefreshing(false);
    showAlert('success', 'Dashboard data successfully refreshed.');
  };

  if (authLoading) {
    return (
      <div className="app-loader-screen">
        <div className="spinner-large"></div>
        <p className="loader-text">Loading ApexFin Analytics...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-dashboard-layout">
      {/* Header */}
      <Header
        onOpenExport={() => setIsExportModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        totalRecords={summary?.totalCount || pagination.total || 300}
      />

      <main className="dashboard-main-container">
        {/* KPI Summary Cards */}
        <MetricsCards summary={summary} loading={loadingStats} />

        {/* Dynamic Recharts Visualizations */}
        <ChartsSection
          monthlyTrends={monthlyTrends}
          categoryBreakdown={categoryBreakdown}
          userBreakdown={userBreakdown}
          loading={loadingStats}
        />

        {/* Advanced Filters & Real-Time Search */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalResults={pagination.total}
        />

        {/* Interactive Transactions Table */}
        <TransactionTable
          transactions={transactions}
          pagination={pagination}
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loadingTx}
          onResetFilters={handleResetFilters}
        />
      </main>

      {/* CSV Export Configuration Modal */}
      <CsvExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filters={filters}
        sampleTransactions={transactions}
        filteredCount={pagination.total}
        totalDatabaseCount={summary?.totalCount || 300}
      />
    </div>
  );
};

export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <AlertChipsTray />
        <DashboardContent />
      </AuthProvider>
    </AlertProvider>
  );
}
