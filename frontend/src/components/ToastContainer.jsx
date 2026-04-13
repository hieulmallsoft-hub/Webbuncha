import { createPortal } from "react-dom";
import { useToast } from "../context/ToastContext.jsx";

const toneMap = {
  success: "site-toast success",
  error: "site-toast error",
  warning: "site-toast warning",
  info: "site-toast"
};

export default function ToastContainer() {
  const { toasts } = useToast();

  if (!toasts.length) return null;

  return createPortal(
    <div className="site-toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={toneMap[toast.type] || toneMap.info}>
          <strong>{toast.title}</strong>
          {toast.message && <p>{toast.message}</p>}
        </div>
      ))}
    </div>,
    document.body
  );
}
