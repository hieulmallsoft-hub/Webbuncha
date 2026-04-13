import { useEffect } from "react";

export default function Modal({ open, title, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admin-modal">
      <div className="admin-modal-backdrop" onClick={onClose} />
      <div className="admin-modal-card">
        <div className="admin-modal-head">
          <h4 className="font-display text-lg">{title}</h4>
          <button className="admin-icon-button" type="button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
