import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`animate-slide-in flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-modal border bg-white pointer-events-auto ${
              toast.type === 'error' ? 'border-error/20' : 
              toast.type === 'warning' ? 'border-secondary-container/20' :
              'border-outline-variant'
            }`}
          >
            {toast.type === 'success' && <span className="material-symbols-outlined text-primary">check_circle</span>}
            {toast.type === 'error' && <span className="material-symbols-outlined text-error">error</span>}
            {toast.type === 'info' && <span className="material-symbols-outlined text-primary-container">info</span>}
            {toast.type === 'warning' && <span className="material-symbols-outlined text-secondary-container">warning</span>}
            
            <span className="text-sm font-semibold text-on-surface">{toast.message}</span>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
