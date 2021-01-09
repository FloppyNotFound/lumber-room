import type { ToastType } from "../enums/toast-type.enum";

export interface ToastItem {
  message: string;
  type: ToastType;
}
