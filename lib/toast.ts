"use client";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type Listener = (toast: ToastItem) => void;

const listeners = new Set<Listener>();
let counter = 0;

export function toast(title: string, variant: ToastVariant = "info", description?: string) {
  const item: ToastItem = { id: ++counter, title, variant, description };
  listeners.forEach((l) => {
    try {
      l(item);
    } catch {
      // ignore
    }
  });
  return item.id;
}

export const toastSuccess = (title: string, description?: string) => toast(title, "success", description);
export const toastError = (title: string, description?: string) => toast(title, "error", description);
export const toastInfo = (title: string, description?: string) => toast(title, "info", description);

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
