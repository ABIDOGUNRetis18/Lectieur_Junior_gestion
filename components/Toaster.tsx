"use client";

import { useState, useEffect } from "react";
import { subscribe, type ToastItem, type ToastVariant } from "@/lib/toast";

const VARIANT_STYLES: Record<ToastVariant, { bar: string; icon: string }> = {
  success: { bar: "bg-secondary", icon: "check_circle" },
  error: { bar: "bg-error", icon: "error" },
  info: { bar: "bg-primary", icon: "info" },
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribe((t) => {
      setToasts((prev) => [...prev.slice(-2), t]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 5000);
    });
  }, []);

  function close(id: number) {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed z-[100] bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 w-[min(92vw,420px)] space-y-2 px-2 pointer-events-none"
    >
      {toasts.map((t) => {
        const styles = VARIANT_STYLES[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto relative overflow-hidden flex items-start gap-3 bg-surface-container-lowest text-on-surface rounded-xl shadow-lg border border-outline-variant/60 pl-4 pr-3 py-3 animate-[toast-in_0.25s_ease-out]"
          >
            <span
              aria-hidden
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.bar}`}
            />
            <span className="material-symbols-outlined text-[22px] leading-none mt-0.5 text-primary">
              {styles.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-label-md text-on-surface">{t.title}</p>
              {t.description && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 break-words">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              aria-label="Fermer la notification"
              onClick={() => close(t.id)}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
