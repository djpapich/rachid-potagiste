import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface ToastItem {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToasterProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
  closeLabel: string;
}

/** Non-blocking confirmations ("added to cart") announced to screen readers. */
export const Toaster: React.FC<ToasterProps> = ({ toasts, onDismiss, closeLabel }) => (
  <div
    aria-live="polite"
    aria-atomic="false"
    className="fixed z-[60] bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm flex flex-col gap-2 pointer-events-none"
  >
    {toasts.map((toast) => (
      <div
        key={toast.id}
        role="status"
        className="toast-in pointer-events-auto flex items-center gap-3 bg-[#1F3D2B] dark:bg-[#E5B834] text-[#FBFAF5] dark:text-[#0D140F] rounded-2xl shadow-2xl px-4 py-3 text-sm font-medium"
      >
        <CheckCircle2 className="w-5 h-5 shrink-0 text-[#C9A227] dark:text-[#1F3D2B]" aria-hidden="true" />
        <span className="flex-1 min-w-0 truncate">{toast.message}</span>
        {toast.actionLabel && toast.onAction && (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.();
              onDismiss(toast.id);
            }}
            className="shrink-0 font-bold underline underline-offset-2 cursor-pointer"
          >
            {toast.actionLabel}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label={closeLabel}
          className="shrink-0 opacity-70 hover:opacity-100 cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    ))}
  </div>
);
