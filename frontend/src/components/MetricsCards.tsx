import React from 'react';
import type { StatsSummary } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, CheckCircle, Clock } from 'lucide-react';

interface MetricsCardsProps {
  summary: StatsSummary | null;
  loading: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ summary, loading }) => {
  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const revenue = summary?.totalRevenue || 0;
  const expense = summary?.totalExpense || 0;
  const netBalance = summary?.netBalance !== undefined ? summary.netBalance : revenue - expense;
  const totalCount = summary?.totalCount || 0;
  const paidCount = summary?.paidCount || 0;
  const pendingCount = summary?.pendingCount || 0;
  const paidPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
  const profitMargin = revenue > 0 ? Math.round((netBalance / revenue) * 100) : 0;

  return (
    <div className="metrics-grid">
      {/* 1. Total Revenue Card */}
      <div className="metric-card card-revenue">
        <div className="metric-header">
          <span className="metric-title">Total Revenue</span>
          <div className="metric-icon-badge revenue">
            <ArrowUpRight size={18} />
          </div>
        </div>
        <div className="metric-body">
          <div className="metric-value text-revenue">
            {loading ? <span className="skeleton-text">...</span> : formatCurrency(revenue)}
          </div>
          <div className="metric-footer">
            <span className="metric-tag tag-success">Cash Inflow</span>
            <span className="metric-caption">
              Across verified revenue streams
            </span>
          </div>
        </div>
      </div>

      {/* 2. Total Expenses Card */}
      <div className="metric-card card-expense">
        <div className="metric-header">
          <span className="metric-title">Total Expenses</span>
          <div className="metric-icon-badge expense">
            <ArrowDownRight size={18} />
          </div>
        </div>
        <div className="metric-body">
          <div className="metric-value text-expense">
            {loading ? <span className="skeleton-text">...</span> : formatCurrency(expense)}
          </div>
          <div className="metric-footer">
            <span className="metric-tag tag-danger">Cash Outflow</span>
            <span className="metric-caption">Operational costs</span>
          </div>
        </div>
      </div>

      {/* 3. Net Cash Flow / Margin Card */}
      <div className="metric-card card-balance">
        <div className="metric-header">
          <span className="metric-title">Net Cash Flow</span>
          <div className="metric-icon-badge balance">
            <Wallet size={18} />
          </div>
        </div>
        <div className="metric-body">
          <div className={`metric-value ${netBalance >= 0 ? 'text-revenue' : 'text-expense'}`}>
            {loading ? <span className="skeleton-text">...</span> : formatCurrency(netBalance)}
          </div>
          <div className="metric-footer">
            <span className={`metric-tag ${profitMargin >= 0 ? 'tag-success' : 'tag-danger'}`}>
              {profitMargin >= 0 ? `+${profitMargin}% Margin` : `${profitMargin}% Margin`}
            </span>
            <span className="metric-caption">Net Operating Position</span>
          </div>
        </div>
      </div>

      {/* 4. Total Transactions & Settlement Ratio */}
      <div className="metric-card card-transactions">
        <div className="metric-header">
          <span className="metric-title">Total Volume</span>
          <div className="metric-icon-badge volume">
            <Activity size={18} />
          </div>
        </div>
        <div className="metric-body">
          <div className="metric-value">
            {loading ? <span className="skeleton-text">...</span> : totalCount.toLocaleString()}
            <span className="metric-unit">txns</span>
          </div>
          <div className="metric-settlement-bar" title={`${paidPercent}% Paid settlements`}>
            <div className="settlement-progress" style={{ width: `${paidPercent}%` }}></div>
          </div>
          <div className="metric-sub-counts">
            <span className="sub-count paid" title="Paid transactions count">
              <CheckCircle size={12} /> {paidCount} Paid ({paidPercent}%)
            </span>
            <span className="sub-count pending" title="Pending transactions count">
              <Clock size={12} /> {pendingCount} Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
