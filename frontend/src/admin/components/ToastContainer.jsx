import { useEffect } from "react";
import { useUiStore } from "../store/uiStore.js";

const toneMap = {
  success: "admin-toast success",
  error: "admin-toast error",
  warning: "admin-toast warning",
  info: "admin-toast"
};

export default function ToastContainer() {
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), toast.duration || 4000)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="admin-toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={toneMap[toast.type] || toneMap.info}>
          <strong>{toast.title}</strong>
          {toast.message && <p>{toast.message}</p>}
        </div>
      ))}
    </div>
  );
}
