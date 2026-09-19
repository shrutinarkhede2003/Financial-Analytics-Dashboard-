import React, { useState, useEffect } from 'react';
import type { FilterParams } from '../types';
import { Search, Filter, X, Calendar, DollarSign, UserCheck, RefreshCcw, Tag } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';

interface FilterBarProps {
  filters: FilterParams;
  onFilterChange: (newFilters: Partial<FilterParams>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const { showAlert } = useAlerts();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onFilterChange({ search: searchInput, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  const handleQuarterPreset = (q: number) => {
    let start = '';
    let end = '';
    if (q === 1) {
      start = '2024-01-01';
      end = '2024-03-31';
    } else if (q === 2) {
      start = '2024-04-01';
      end = '2024-06-30';
    } else if (q === 3) {
      start = '2024-07-01';
      end = '2024-09-30';
    } else if (q === 4) {
      start = '2024-10-01';
      end = '2024-12-31';
    }
    onFilterChange({ startDate: start, endDate: end, page: 1 });
    showAlert('info', `Applied Q${q} 2024 date preset.`);
  };

  // Count active filters (excluding pagination & sorting)
  const activeFilterList: { key: keyof FilterParams; label: string; value: string }[] = [];

  if (filters.category && filters.category !== 'All') {
    activeFilterList.push({ key: 'category', label: 'Category', value: filters.category });
  }
  if (filters.status && filters.status !== 'All') {
    activeFilterList.push({ key: 'status', label: 'Status', value: filters.status });
  }
  if (filters.user_id && filters.user_id !== 'All') {
    activeFilterList.push({ key: 'user_id', label: 'Analyst', value: filters.user_id });
  }
  if (filters.startDate || filters.endDate) {
    activeFilterList.push({
      key: 'startDate',
      label: 'Date Range',
      value: `${filters.startDate || 'Start'} → ${filters.endDate || 'End'}`,
    });
  }
  if (filters.minAmount || filters.maxAmount) {
    activeFilterList.push({
      key: 'minAmount',
      label: 'Amount Range',
      value: `$${filters.minAmount || '0'} - $${filters.maxAmount || '∞'}`,
    });
  }
  if (filters.search) {
    activeFilterList.push({ key: 'search', label: 'Search', value: `"${filters.search}"` });
  }

  const removeFilter = (key: keyof FilterParams) => {
    if (key === 'startDate' || key === 'endDate') {
      onFilterChange({ startDate: '', endDate: '', page: 1 });
    } else if (key === 'minAmount' || key === 'maxAmount') {
      onFilterChange({ minAmount: '', maxAmount: '', page: 1 });
    } else if (key === 'search') {
      setSearchInput('');
      onFilterChange({ search: '', page: 1 });
    } else {
      onFilterChange({ [key]: 'All', page: 1 });
    }
  };

  return (
    <div className="filter-panel-card">
      {/* Primary Search & Quick Filters Bar */}
      <div className="filter-primary-row">
        {/* Real-time search */}
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search by ID, User, Category, Status, or Amount..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearchInput('');
                onFilterChange({ search: '', page: 1 });
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="filter-select-group">
          <label htmlFor="filter-cat" className="filter-label">
            <Tag size={13} />
            <span>Category</span>
          </label>
          <select
            id="filter-cat"
            className="filter-select"
            value={filters.category || 'All'}
            onChange={(e) => onFilterChange({ category: e.target.value, page: 1 })}
          >
            <option value="All">All Categories</option>
            <option value="Revenue">Revenue (Inflows)</option>
            <option value="Expense">Expense (Outflows)</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="filter-select-group">
          <label htmlFor="filter-status" className="filter-label">
            <UserCheck size={13} />
            <span>Status</span>
          </label>
          <select
            id="filter-status"
            className="filter-select"
            value={filters.status || 'All'}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid (Completed)</option>
            <option value="Pending">Pending (Processing)</option>
          </select>
        </div>

        {/* User Dropdown */}
        <div className="filter-select-group">
          <label htmlFor="filter-user" className="filter-label">
            <span>Analyst</span>
          </label>
          <select
            id="filter-user"
            className="filter-select"
            value={filters.user_id || 'All'}
            onChange={(e) => onFilterChange({ user_id: e.target.value, page: 1 })}
          >
            <option value="All">All Analysts</option>
            <option value="user_001">user_001</option>
            <option value="user_002">user_002</option>
            <option value="user_003">user_003</option>
            <option value="user_004">user_004</option>
          </select>
        </div>

        {/* Advanced Filters Toggle Button */}
        <button
          type="button"
          className={`advanced-toggle-btn ${showAdvanced ? 'active' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter size={15} />
          <span>{showAdvanced ? 'Hide Advanced' : 'More Filters'}</span>
          {activeFilterList.length > 0 && <span className="active-count-badge">{activeFilterList.length}</span>}
        </button>
      </div>

      {/* Advanced Filter Collapsible Section (Date Range & Amount Range) */}
      {showAdvanced && (
        <div className="filter-advanced-row">
          {/* Date Range with Shortcuts */}
          <div className="advanced-field date-field">
            <label className="filter-label">
              <Calendar size={13} />
              <span>Date Range</span>
            </label>
            <div className="date-inputs">
              <input
                type="date"
                className="filter-date-input"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange({ startDate: e.target.value, page: 1 })}
                title="Start Date"
              />
              <span className="date-sep">to</span>
              <input
                type="date"
                className="filter-date-input"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange({ endDate: e.target.value, page: 1 })}
                title="End Date"
              />
            </div>
            {/* Quarter Preset Chips */}
            <div className="preset-chips">
              <span className="preset-title">Presets:</span>
              <button type="button" className="preset-chip" onClick={() => handleQuarterPreset(1)}>
                Q1
              </button>
              <button type="button" className="preset-chip" onClick={() => handleQuarterPreset(2)}>
                Q2
              </button>
              <button type="button" className="preset-chip" onClick={() => handleQuarterPreset(3)}>
                Q3
              </button>
              <button type="button" className="preset-chip" onClick={() => handleQuarterPreset(4)}>
                Q4
              </button>
              <button
                type="button"
                className="preset-chip"
                onClick={() => onFilterChange({ startDate: '', endDate: '', page: 1 })}
              >
                All
              </button>
            </div>
          </div>

          {/* Amount Range */}
          <div className="advanced-field amount-field">
            <label className="filter-label">
              <DollarSign size={13} />
              <span>Amount Range ($)</span>
            </label>
            <div className="amount-inputs">
              <input
                type="number"
                min="0"
                step="50"
                className="filter-number-input"
                placeholder="Min $"
                value={filters.minAmount || ''}
                onChange={(e) => onFilterChange({ minAmount: e.target.value, page: 1 })}
              />
              <span className="date-sep">to</span>
              <input
                type="number"
                min="0"
                step="50"
                className="filter-number-input"
                placeholder="Max $"
                value={filters.maxAmount || ''}
                onChange={(e) => onFilterChange({ maxAmount: e.target.value, page: 1 })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips & Summary Bar */}
      {activeFilterList.length > 0 && (
        <div className="active-filters-strip">
          <div className="active-chips-list">
            <span className="active-label">Active Filters ({totalResults} matches):</span>
            {activeFilterList.map((f) => (
              <span key={f.key} className="active-filter-chip">
                <span className="chip-key">{f.label}:</span>
                <span className="chip-val">{f.value}</span>
                <button
                  type="button"
                  className="chip-del"
                  onClick={() => removeFilter(f.key)}
                  title={`Remove ${f.label} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <button type="button" className="reset-all-filters-btn" onClick={onResetFilters}>
            <RefreshCcw size={13} />
            <span>Reset All</span>
          </button>
        </div>
      )}
    </div>
  );
};
