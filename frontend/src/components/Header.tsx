import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Download, RefreshCw, LogOut, Database } from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onRefresh,
  isRefreshing,
  totalRecords,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="header-brand">
          <div className="brand-logo-badge">
            <TrendingUp size={22} />
          </div>
          <div>
            <h1 className="header-title">ApexFin Analytics</h1>
            <p className="header-subtitle">Company Financial Transactions & Intelligence</p>
          </div>
        </div>

        <div className="system-status-pill" title="Connected to MongoDB database">
          <span className="status-pulse-dot"></span>
          <Database size={13} className="db-icon" />
          <span>MongoDB Connected &bull; {totalRecords} Records</span>
        </div>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="header-btn secondary-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh dashboard data"
        >
          <RefreshCw size={16} className={isRefreshing ? 'spin-icon' : ''} />
          <span className="btn-label">Refresh</span>
        </button>

        <button
          type="button"
          className="header-btn primary-btn export-btn"
          onClick={onOpenExport}
          title="Configure and download CSV report"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>

        <div className="header-divider"></div>

        {user && (
          <div className="user-profile-widget">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
              alt={user.name}
              className="user-avatar"
            />
            <div className="user-meta">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button
              type="button"
              className="logout-btn"
              onClick={logout}
              title="Sign out of account"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
