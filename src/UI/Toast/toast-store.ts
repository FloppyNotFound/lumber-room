import { Subscriber, Unsubscriber, writable } from 'svelte/store';
import type { ToastItem } from './models/toast-item.model';
import ToastType from './enums/toast-type.enum';

interface ToastStore {
  subscribe: (
    this: void,
    run: Subscriber<ToastItem | undefined>
  ) => Unsubscriber;
  info: (message: string) => void;
  warn: (message: string) => void;
  alert: (message: string) => void;
}

const createToastStore = (): ToastStore => {
  const { subscribe, set } = writable<ToastItem | undefined>(void 0);

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

const toastStore = createToastStore();

export default toastStore;
