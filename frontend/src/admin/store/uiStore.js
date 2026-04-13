import { create } from "zustand";
import { notify } from "../../lib/notify.js";

const uid = () => Math.random().toString(36).slice(2, 9);

export const useUiStore = create(() => ({
  toasts: [],
  addToast: (toast) => {
    const id = uid();
    notify({
      type: toast?.type,
      title: toast?.title,
      message: toast?.message,
      duration: toast?.duration
    });
    return id;
  },
  removeToast: () => {},
  clearToasts: () => {}
}));
