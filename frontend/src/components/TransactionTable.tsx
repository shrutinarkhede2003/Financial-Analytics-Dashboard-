import React from 'react';
import type { Transaction, FilterParams, PaginationMeta } from '../types';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  User,
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  pagination: PaginationMeta;
  filters: FilterParams;
  onFilterChange: (newFilters: Partial<FilterParams>) => void;
  loading: boolean;
  onResetFilters: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  pagination,
  filters,
  onFilterChange,
  loading,
  onResetFilters,
}) => {
  const { page, limit, total, totalPages } = pagination;
  const currentSortBy = filters.sortBy || 'date';
  const currentSortOrder = filters.sortOrder || 'desc';

  const handleSort = (field: 'id' | 'date' | 'amount' | 'category' | 'status' | 'user_id') => {
    if (currentSortBy === field) {
      // Toggle order
      onFilterChange({
        sortOrder: currentSortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    } else {
      // New column, default to descending for numbers/dates, ascending for text
      onFilterChange({
        sortBy: field,
        sortOrder: field === 'amount' || field === 'date' || field === 'id' ? 'desc' : 'asc',
        page: 1,
      });
    }
  };

  const renderSortIndicator = (field: string) => {
    if (currentSortBy !== field) {
      return <ArrowUpDown size={13} className="sort-icon inactive" />;
    }
    return currentSortOrder === 'asc' ? (
      <ArrowUp size={13} className="sort-icon active" />
    ) : (
      <ArrowDown size={13} className="sort-icon active" />
    );
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  const formatCurrency = (amount: number, category: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);

    return category === 'Revenue' ? `+${formatted}` : `-${formatted}`;
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const startEntry = total === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  return (
    <div className="table-card">
      <div className="table-header-bar">
        <div className="table-title-group">
          <h2 className="table-title">Transaction Records</h2>
          <span className="table-count-badge">
            {total} Total Transactions
          </span>
        </div>

        <div className="table-controls">
          <label htmlFor="page-size-select" className="page-size-label">
            Rows per page:
          </label>
          <select
            id="page-size-select"
            className="page-size-select"
            value={limit}
            onChange={(e) => onFilterChange({ limit: Number(e.target.value), page: 1 })}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-responsive-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable-th th-id">
                <div className="th-content">
                  <span># ID</span>
                  {renderSortIndicator('id')}
                </div>
              </th>
              <th onClick={() => handleSort('date')} className="sortable-th th-date">
                <div className="th-content">
                  <span>Timestamp</span>
                  {renderSortIndicator('date')}
                </div>
              </th>
              <th onClick={() => handleSort('user_id')} className="sortable-th th-user">
                <div className="th-content">
                  <span>Analyst</span>
                  {renderSortIndicator('user_id')}
                </div>
              </th>
              <th onClick={() => handleSort('category')} className="sortable-th th-category">
                <div className="th-content">
                  <span>Category</span>
                  {renderSortIndicator('category')}
                </div>
              </th>
              <th onClick={() => handleSort('amount')} className="sortable-th th-amount">
                <div className="th-content">
                  <span>Amount</span>
                  {renderSortIndicator('amount')}
                </div>
              </th>
              <th onClick={() => handleSort('status')} className="sortable-th th-status">
                <div className="th-content">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>
              <th className="th-actions">Profile</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeletons
              Array.from({ length: Math.min(limit, 8) }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="skeleton-row">
                  <td><span className="skeleton-cell w-12"></span></td>
                  <td><span className="skeleton-cell w-28"></span></td>
                  <td><span className="skeleton-cell w-24"></span></td>
                  <td><span className="skeleton-cell w-20"></span></td>
                  <td><span className="skeleton-cell w-20"></span></td>
                  <td><span className="skeleton-cell w-16"></span></td>
                  <td><span className="skeleton-cell w-10"></span></td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty-cell">
                  <div className="empty-state-box">
                    <Inbox size={40} className="empty-state-icon" />
                    <h4>No transactions found</h4>
                    <p>No records matched your active filter or search criteria.</p>
                    <button type="button" className="btn-clear-empty" onClick={onResetFilters}>
                      Reset All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isRevenue = tx.category === 'Revenue';
                const isPaid = tx.status === 'Paid';

                return (
                  <tr key={tx.id} className="transaction-row">
                    {/* ID */}
                    <td className="cell-id">
                      <span className="id-pill">#{tx.id}</span>
                    </td>

                    {/* Date */}
                    <td className="cell-date">
                      <span className="date-text">{formatDate(tx.date)}</span>
                    </td>

                    {/* Analyst / User */}
                    <td className="cell-user">
                      <div className="user-cell-wrapper">
                        {tx.user_profile ? (
                          <img
                            src={tx.user_profile}
                            alt={tx.user_id}
                            className="analyst-avatar"
                            onError={(e) => {
                              // fallback to icon if image fails
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="analyst-avatar-fallback">
                            <User size={12} />
                          </div>
                        )}
                        <span className="analyst-tag">{tx.user_id}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="cell-category">
                      <span className={`category-badge ${isRevenue ? 'badge-revenue' : 'badge-expense'}`}>
                        <span className="badge-dot"></span>
                        {tx.category}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="cell-amount">
                      <span className={`amount-text ${isRevenue ? 'text-revenue' : 'text-expense'}`}>
                        {formatCurrency(tx.amount, tx.category)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="cell-status">
                      <span className={`status-pill ${isPaid ? 'status-paid' : 'status-pending'}`}>
                        {isPaid ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        <span>{tx.status}</span>
                      </span>
                    </td>

                    {/* Profile link */}
                    <td className="cell-actions">
                      <a
                        href={tx.user_profile}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-link-btn"
                        title="View user profile image source"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Bar */}
      {totalPages > 0 && (
        <div className="table-pagination-footer">
          <div className="pagination-info">
            Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of <strong>{total}</strong> entries
          </div>

          <div className="pagination-nav">
            <button
              type="button"
              className="page-nav-btn"
              disabled={page <= 1 || loading}
              onClick={() => onFilterChange({ page: 1 })}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              className="page-nav-btn"
              disabled={page <= 1 || loading}
              onClick={() => onFilterChange({ page: page - 1 })}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="page-numbers">
              {getPageNumbers().map((num, idx) =>
                num === '...' ? (
                  <span key={`ellipsis-${idx}`} className="page-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${num}`}
                    type="button"
                    className={`page-num-btn ${page === num ? 'active' : ''}`}
                    onClick={() => onFilterChange({ page: Number(num) })}
                    disabled={loading}
                  >
                    {num}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              className="page-nav-btn"
              disabled={page >= totalPages || loading}
              onClick={() => onFilterChange({ page: page + 1 })}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className="page-nav-btn"
              disabled={page >= totalPages || loading}
              onClick={() => onFilterChange({ page: totalPages })}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
