"use client";

import { create } from "zustand";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  push: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string, type: ToastType = "info") {
  useToast.getState().push(message, type);
}

const typeStyles: Record<ToastType, string> = {
  success: "border-success/40 text-success",
  error: "border-danger/40 text-danger",
  info: "border-primary/40 text-primary-300",
};

export function ToastViewport() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "glass-card px-4 py-3 text-sm animate-fade-in-up border-l-2",
            typeStyles[t.type],
          )}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-text-primary">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-text-tertiary hover:text-text-primary"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
