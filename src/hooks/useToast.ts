import { useState, useCallback } from 'react';
import { ToastProps } from '../components/ui/Toast';

/**
 * Custom hook for managing toast notifications
 * Provides methods to show, hide, and manage toast messages
 * Supports auto-dismiss and multiple toast variants
 */

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ShowToastOptions {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

interface UseToastReturn {
  toasts: ToastProps[];
  showToast: (options: ShowToastOptions) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (message: string, title?: string) => string;
  showError: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
}

let toastIdCounter = 0;

const generateToastId = (): string => {
  toastIdCounter += 1;
  return `toast-${toastIdCounter}-${Date.now()}`;
};

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, variant = 'info', duration = 5000 }: ShowToastOptions): string => {
      const id = generateToastId();
      const newToast: ToastProps = {
        id,
        title,
        message,
        variant,
        duration,
        onClose: hideToast
      };

      setToasts((prevToasts) => [...prevToasts, newToast]);
      return id;
    },
    [hideToast]
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast variants
  const showSuccess = useCallback(
    (message: string, title?: string): string => {
      return showToast({ message, title, variant: 'success' });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title?: string): string => {
      return showToast({ message, title, variant: 'error', duration: 7000 });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title?: string): string => {
      return showToast({ message, title, variant: 'warning', duration: 6000 });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title?: string): string => {
      return showToast({ message, title, variant: 'info' });
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useToast;