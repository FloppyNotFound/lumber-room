import { writable } from "svelte/store";
import type { ToastItem } from "./models/toast-item.model";
import { ToastType } from "./enums/toast-type.enum";

const createToastStore = () => {
  const { subscribe, set } = writable<ToastItem>(void 0);

  return {
    subscribe,
    info: (message: string): void =>
      set(<ToastItem>{
        message,
        type: ToastType.Info,
      }),
    warn: (message: string): void =>
      set(<ToastItem>{
        message,
        type: ToastType.Warn,
      }),
    alert: (message: string): void =>
      set(<ToastItem>{
        message,
        type: ToastType.Alert,
      }),
  };
};

export const toastStore = createToastStore();
