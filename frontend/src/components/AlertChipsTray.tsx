import React from 'react';
import { useAlerts } from '../context/AlertContext';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export const AlertChipsTray: React.FC = () => {
  const { alerts, dismissAlert } = useAlerts();

  if (alerts.length === 0) return null;

  return (
    <div className="alert-chips-container" role="region" aria-label="System notifications">
      {alerts.map((alert) => {
        let icon = <Info className="chip-icon info" size={16} />;
        let chipClass = 'alert-chip alert-chip-info';

        if (alert.type === 'error') {
          icon = <AlertCircle className="chip-icon error" size={16} />;
          chipClass = 'alert-chip alert-chip-error';
        } else if (alert.type === 'warning') {
          icon = <AlertTriangle className="chip-icon warning" size={16} />;
          chipClass = 'alert-chip alert-chip-warning';
        } else if (alert.type === 'success') {
          icon = <CheckCircle2 className="chip-icon success" size={16} />;
          chipClass = 'alert-chip alert-chip-success';
        }

        return (
          <div key={alert.id} className={chipClass} role="alert">
            <div className="chip-content">
              {icon}
              <span className="chip-message">{alert.message}</span>
            </div>

            <div className="chip-actions">
              {alert.actionLabel && alert.onAction && (
                <button
                  type="button"
                  className="chip-action-btn"
                  onClick={() => {
                    alert.onAction?.();
                    dismissAlert(alert.id);
                  }}
                >
                  {alert.actionLabel}
                </button>
              )}

              <button
                type="button"
                className="chip-close-btn"
                aria-label="Dismiss alert"
                onClick={() => dismissAlert(alert.id)}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
