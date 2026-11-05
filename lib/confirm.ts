"use client";

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type Listener = (opts: ConfirmOptions | null) => void;

const listeners = new Set<Listener>();
let resolveCurrent: ((value: boolean) => void) | null = null;

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    resolveCurrent = resolve;
    listeners.forEach((l) => l(opts));
  });
}

export function resolveConfirm(value: boolean) {
  const resolve = resolveCurrent;
  resolveCurrent = null;
  listeners.forEach((l) => l(null));
  resolve?.(value);
}

export function subscribeConfirm(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
