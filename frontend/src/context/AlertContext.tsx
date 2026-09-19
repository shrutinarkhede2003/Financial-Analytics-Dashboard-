import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AlertChip, AlertType } from '../types';


interface AlertOptions {
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface AlertContextType {
  alerts: AlertChip[];
  showAlert: (type: AlertType, message: string, options?: AlertOptions) => string;
  dismissAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertChip[]>([]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const showAlert = useCallback(
    (type: AlertType, message: string, options?: AlertOptions): string => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newAlert: AlertChip = {
        id,
        type,
        message,
        timestamp: Date.now(),
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
      };

      setAlerts((prev) => {
        // Keep at most 4 active alerts to avoid clutter
        const updated = [...prev, newAlert];
        return updated.slice(-4);
      });

      // Default durations: errors stay a bit longer (8s), successes/infos 5s
      const duration = options?.durationMs ?? (type === 'error' ? 8000 : 5000);
      if (duration > 0) {
        setTimeout(() => {
          dismissAlert(id);
        }, duration);
      }

      return id;
    },
    [dismissAlert]
  );

  return (
    <AlertContext.Provider value={{ alerts, showAlert, dismissAlert, clearAllAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
