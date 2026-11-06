import { create } from "zustand";
import { haptics } from "../lib/haptics";

export type ToastTone = "success" | "info" | "warning" | "error";

export interface ToastAction {
  readonly label: string;
  readonly onPress: () => void;
}

export interface ToastMessage {
  readonly id: string;
  readonly tone: ToastTone;
  readonly title: string;
  readonly message?: string;
  readonly action?: ToastAction;
  readonly durationMs: number;
}

export interface ShowToastInput {
  readonly tone?: ToastTone;
  readonly title: string;
  readonly message?: string;
  readonly action?: ToastAction;
  readonly durationMs?: number;
}

interface ToastState {
  queue: readonly ToastMessage[];
  show: (input: ShowToastInput) => string;
  dismiss: (id: string) => void;
}

const DEFAULT_DURATION_MS = 3200;
let toastSeq = 0;

function fireHaptic(tone: ToastTone): void {
  if (tone === "success") haptics.success();
  else if (tone === "error") haptics.error();
  else if (tone === "warning") haptics.warning();
  else haptics.light();
}

export const useToastStore = create<ToastState>((set) => ({
  queue: [],
  show: (input) => {
    toastSeq += 1;
    const toast: ToastMessage = {
      id: `toast_${toastSeq}`,
      tone: input.tone ?? "success",
      title: input.title,
      message: input.message,
      action: input.action,
      durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
    };
    fireHaptic(toast.tone);
    // Keep at most 3 queued; newest is shown on top of the stack.
    set((s) => ({ queue: [...s.queue.slice(-2), toast] }));
    return toast.id;
  },
  dismiss: (id) => set((s) => ({ queue: s.queue.filter((t) => t.id !== id) })),
}));

export interface ToastApi {
  show: (input: ShowToastInput) => string;
  success: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  dismiss: (id: string) => void;
}

/** Imperative API usable outside React (stores, services). */
export const toast: ToastApi = {
  show: (input) => useToastStore.getState().show(input),
  success: (title, message) => useToastStore.getState().show({ tone: "success", title, message }),
  info: (title, message) => useToastStore.getState().show({ tone: "info", title, message }),
  warning: (title, message) => useToastStore.getState().show({ tone: "warning", title, message }),
  error: (title, message) => useToastStore.getState().show({ tone: "error", title, message }),
  dismiss: (id) => useToastStore.getState().dismiss(id),
};

export function useToast(): ToastApi {
  return toast;
}
