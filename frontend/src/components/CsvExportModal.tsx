import React, { useState, useMemo } from 'react';
import type { FilterParams, Transaction } from '../types';
import { api } from '../api/client';
import { useAlerts } from '../context/AlertContext';
import {
  Download,
  X,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Eye,
  Check,
  Calendar,
  DollarSign,
} from 'lucide-react';


interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterParams;
  sampleTransactions: Transaction[];
  filteredCount: number;
  totalDatabaseCount: number;
}

interface ColumnDef {
  key: string;
  defaultAlias: string;
  sampleValue: (t: Transaction, dateFormat: string, formatCurrency: boolean) => string;
}

const ALL_COLUMNS: ColumnDef[] = [
  {
    key: 'id',
    defaultAlias: 'Transaction ID',
    sampleValue: (t) => String(t.id),
  },
  {
    key: 'date',
    defaultAlias: 'Timestamp',
    sampleValue: (t, dateFormat) => {
      const d = new Date(t.date);
      return dateFormat === 'locale' ? d.toLocaleDateString() : d.toISOString();
    },
  },
  {
    key: 'amount',
    defaultAlias: 'Amount',
    sampleValue: (t, _, formatCurrency) =>
      formatCurrency ? `$${Number(t.amount).toFixed(2)}` : Number(t.amount).toFixed(2),
  },
  {
    key: 'category',
    defaultAlias: 'Category',
    sampleValue: (t) => t.category,
  },
  {
    key: 'status',
    defaultAlias: 'Payment Status',
    sampleValue: (t) => t.status,
  },
  {
    key: 'user_id',
    defaultAlias: 'Analyst ID',
    sampleValue: (t) => t.user_id,
  },
  {
    key: 'user_profile',
    defaultAlias: 'Profile Image URL',
    sampleValue: (t) => t.user_profile || '',
  },
];

export const CsvExportModal: React.FC<CsvExportModalProps> = ({
  isOpen,
  onClose,
  filters,
  sampleTransactions,
  filteredCount,
  totalDatabaseCount,
}) => {
  const { showAlert } = useAlerts();

  // Export state
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'id',
    'date',
    'amount',
    'category',
    'status',
    'user_id',
  ]);

  const [columnAliases, setColumnAliases] = useState<Record<string, string>>({
    id: 'Transaction ID',
    date: 'Timestamp',
    amount: 'Amount (USD)',
    category: 'Category',
    status: 'Payment Status',
    user_id: 'Analyst ID',
    user_profile: 'Profile Image URL',
  });

  const [scope, setScope] = useState<'filtered' | 'all'>('filtered');
  const [dateFormat, setDateFormat] = useState<'iso' | 'locale'>('locale');
  const [formatCurrency, setFormatCurrency] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleToggleColumn = (colKey: string) => {
    if (selectedColumns.includes(colKey)) {
      if (selectedColumns.length === 1) {
        showAlert('warning', 'At least one column must be selected for CSV export.');
        return;
      }
      setSelectedColumns(selectedColumns.filter((c) => c !== colKey));
    } else {
      setSelectedColumns([...selectedColumns, colKey]);
    }
  };

  const handleSelectAll = () => {
    setSelectedColumns(ALL_COLUMNS.map((c) => c.key));
  };

  const handleDeselectAll = () => {
    // Keep at least ID
    setSelectedColumns(['id']);
  };

  const handleAliasChange = (key: string, value: string) => {
    setColumnAliases((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetDefaults = () => {
    setSelectedColumns(['id', 'date', 'amount', 'category', 'status', 'user_id']);
    const defs: Record<string, string> = {};
    ALL_COLUMNS.forEach((c) => {
      defs[c.key] = c.defaultAlias;
    });
    setColumnAliases(defs);
    setDateFormat('locale');
    setFormatCurrency(true);
    setScope('filtered');
  };

  // Live preview rows
  const previewRows = useMemo(() => {
    const previewSample = sampleTransactions.slice(0, 3);
    return previewSample.map((t) => {
      const row: Record<string, string> = {};
      selectedColumns.forEach((colKey) => {
        const colDef = ALL_COLUMNS.find((c) => c.key === colKey);
        const header = columnAliases[colKey] || colKey.toUpperCase();
        row[header] = colDef ? colDef.sampleValue(t, dateFormat, formatCurrency) : '';
      });
      return row;
    });
  }, [sampleTransactions, selectedColumns, columnAliases, dateFormat, formatCurrency]);

  const previewHeaders = useMemo(() => {
    return selectedColumns.map((k) => columnAliases[k] || k.toUpperCase());
  }, [selectedColumns, columnAliases]);

  const handleExecuteExport = async () => {
    if (selectedColumns.length === 0) {
      showAlert('error', 'Please select at least one column to export.');
      return;
    }

    setIsExporting(true);
    try {
      const result = await api.exportCsv({
        columns: selectedColumns,
        columnAliases,
        dateFormat,
        formatCurrency,
        filters,
        scope,
      });

      showAlert(
        'success',
        `CSV downloaded successfully as "${result.filename}" (${scope === 'all' ? totalDatabaseCount : filteredCount} records)!`
      );
      onClose();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to download CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const recordsToExportCount = scope === 'all' ? totalDatabaseCount : filteredCount;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="csv-modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="modal-title">Configure CSV Export</h2>
              <p className="modal-subtitle">
                Customize column selection, custom header names, and formatting options
              </p>
            </div>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-scroll">
          {/* 1. Export Scope Selector */}
          <div className="modal-section">
            <h4 className="section-label">1. Select Data Scope</h4>
            <div className="scope-cards-grid">
              <div
                className={`scope-card ${scope === 'filtered' ? 'active' : ''}`}
                onClick={() => setScope('filtered')}
                role="button"
                tabIndex={0}
              >
                <div className="scope-radio">
                  <div className="radio-inner"></div>
                </div>
                <div className="scope-info">
                  <span className="scope-title">Filtered Records Only</span>
                  <span className="scope-desc">
                    Exports only the {filteredCount} transactions matching your active filters
                  </span>
                </div>
                <span className="scope-count-badge">{filteredCount} rows</span>
              </div>

              <div
                className={`scope-card ${scope === 'all' ? 'active' : ''}`}
                onClick={() => setScope('all')}
                role="button"
                tabIndex={0}
              >
                <div className="scope-radio">
                  <div className="radio-inner"></div>
                </div>
                <div className="scope-info">
                  <span className="scope-title">Complete Database (All)</span>
                  <span className="scope-desc">
                    Exports all {totalDatabaseCount} company transactions regardless of filters
                  </span>
                </div>
                <span className="scope-count-badge">{totalDatabaseCount} rows</span>
              </div>
            </div>
          </div>

          {/* 2. Column Selection & Header Renaming */}
          <div className="modal-section">
            <div className="section-header-flex">
              <div>
                <h4 className="section-label">2. Column Selection & Header Customization</h4>
                <p className="section-subtext">Check the columns to include and rename column headers as desired</p>
              </div>

              <div className="quick-select-actions">
                <button type="button" className="text-action-btn" onClick={handleSelectAll}>
                  <CheckSquare size={13} /> Select All
                </button>
                <button type="button" className="text-action-btn" onClick={handleDeselectAll}>
                  <Square size={13} /> Clear
                </button>
                <button type="button" className="text-action-btn reset" onClick={handleResetDefaults}>
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="columns-config-grid">
              {ALL_COLUMNS.map((col) => {
                const isChecked = selectedColumns.includes(col.key);
                return (
                  <div key={col.key} className={`column-config-row ${isChecked ? 'checked' : ''}`}>
                    <label className="column-checkbox-label">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleColumn(col.key)}
                      />
                      <span className="checkbox-custom">
                        {isChecked && <Check size={12} />}
                      </span>
                      <span className="column-key-name">{col.key}</span>
                    </label>

                    <div className="alias-input-wrapper">
                      <span className="alias-label">Header:</span>
                      <input
                        type="text"
                        className="column-alias-input"
                        value={columnAliases[col.key] || ''}
                        disabled={!isChecked}
                        onChange={(e) => handleAliasChange(col.key, e.target.value)}
                        placeholder={col.defaultAlias}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Formatting Options */}
          <div className="modal-section">
            <h4 className="section-label">3. Formatting Preferences</h4>
            <div className="formatting-options-grid">
              {/* Date Format */}
              <div className="format-box">
                <div className="format-box-title">
                  <Calendar size={15} />
                  <span>Date Format</span>
                </div>
                <div className="format-options">
                  <label className="format-radio-label">
                    <input
                      type="radio"
                      name="dateFormat"
                      value="locale"
                      checked={dateFormat === 'locale'}
                      onChange={() => setDateFormat('locale')}
                    />
                    <span>Locale Date (e.g. 1/15/2024)</span>
                  </label>
                  <label className="format-radio-label">
                    <input
                      type="radio"
                      name="dateFormat"
                      value="iso"
                      checked={dateFormat === 'iso'}
                      onChange={() => setDateFormat('iso')}
                    />
                    <span>ISO 8601 (2024-01-15T08:34:12Z)</span>
                  </label>
                </div>
              </div>

              {/* Currency Format */}
              <div className="format-box">
                <div className="format-box-title">
                  <DollarSign size={15} />
                  <span>Amount Presentation</span>
                </div>
                <div className="format-options">
                  <label className="format-radio-label">
                    <input
                      type="radio"
                      name="currencyFormat"
                      checked={formatCurrency}
                      onChange={() => setFormatCurrency(true)}
                    />
                    <span>Formatted Currency ($1,500.00)</span>
                  </label>
                  <label className="format-radio-label">
                    <input
                      type="radio"
                      name="currencyFormat"
                      checked={!formatCurrency}
                      onChange={() => setFormatCurrency(false)}
                    />
                    <span>Raw Numeric (1500.00)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Live CSV Preview Table */}
          <div className="modal-section preview-section">
            <div className="section-header-flex">
              <div className="preview-title-group">
                <Eye size={16} />
                <h4 className="section-label mb-0">Live CSV File Preview</h4>
                <span className="preview-badge">First 3 Rows Sample</span>
              </div>
              <button
                type="button"
                className="text-action-btn"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Collapse Preview' : 'Expand Preview'}
              </button>
            </div>

            {showPreview && (
              <div className="csv-preview-table-wrapper">
                <table className="csv-preview-table">
                  <thead>
                    <tr>
                      {previewHeaders.map((header, i) => (
                        <th key={i}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.length === 0 ? (
                      <tr>
                        <td colSpan={previewHeaders.length} className="text-center">
                          No preview records available
                        </td>
                      </tr>
                    ) : (
                      previewRows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {previewHeaders.map((header, colIdx) => (
                            <td key={colIdx}>{row[header]}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="modal-footer">
          <div className="export-summary-text">
            Will export <strong>{recordsToExportCount} records</strong> with{' '}
            <strong>{selectedColumns.length} columns</strong>
          </div>

          <div className="modal-btn-group">
            <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={isExporting}>
              Cancel
            </button>
            <button
              type="button"
              className="modal-btn-download"
              onClick={handleExecuteExport}
              disabled={isExporting || selectedColumns.length === 0}
            >
              {isExporting ? (
                <span>Generating CSV...</span>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download CSV Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
