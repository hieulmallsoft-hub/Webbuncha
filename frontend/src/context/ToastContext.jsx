import { createContext, useCallback, useContext, useMemo } from "react";
import { notify } from "../lib/notify.js";

const ToastContext = createContext(null);

const uid = () => Math.random().toString(36).slice(2, 9);

export const ToastProvider = ({ children }) => {
  const removeToast = useCallback(() => {}, []);

  const addToast = useCallback((toast) => {
    const id = uid();
    notify({
      type: toast?.type,
      title: toast?.title,
      message: toast?.message,
      duration: toast?.duration
    });
    return id;
  }, []);

  const value = useMemo(
    () => ({
      toasts: [],
      addToast,
      removeToast
    }),
    [addToast, removeToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return value;
};
