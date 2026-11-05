"use client";

import { useEffect, useState } from "react";
import { subscribeConfirm, resolveConfirm, type ConfirmOptions } from "@/lib/confirm";

export default function ConfirmDialog() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);

  useEffect(() => subscribeConfirm(setOpts), []);

  useEffect(() => {
    if (!opts) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") resolveConfirm(false);
      if (e.key === "Enter") resolveConfirm(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts]);

  if (!opts) return null;

  const confirmLabel = opts.confirmLabel ?? (opts.danger ? "Supprimer" : "Confirmer");
  const cancelLabel = opts.cancelLabel ?? "Annuler";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={opts.title}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-black/50 animate-[fade-in_0.2s_ease-out]"
        onClick={() => resolveConfirm(false)}
      />
      <div className="relative bg-surface-container-lowest text-on-surface rounded-2xl shadow-2xl w-full max-w-md p-space-md space-y-space-sm animate-[toast-in_0.2s_ease-out]">
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center justify-center w-11 h-11 rounded-full ${
              opts.danger ? "bg-error-container text-error" : "bg-primary-container text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {opts.danger ? "warning" : "help"}
            </span>
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface flex-1 min-w-0">{opts.title}</h2>
        </div>
        {opts.message && (
          <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">{opts.message}</p>
        )}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => resolveConfirm(false)}
            className="h-[48px] px-space-md rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-highest transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => resolveConfirm(true)}
            className={`h-[48px] px-space-md rounded-lg font-label-md font-semibold transition-colors ${
              opts.danger
                ? "bg-error text-on-error hover:bg-error/90"
                : "bg-primary text-on-primary hover:bg-primary/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
