import { useEffect } from "react";

const joinClasses = (...values) => values.filter(Boolean).join(" ");

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  cardClassName,
  headClassName,
  titleClassName,
  bodyClassName,
  footerClassName
}) {
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
      <div className={joinClasses("admin-modal-card", cardClassName)}>
        <div className={joinClasses("admin-modal-head", headClassName)}>
          <h4 className={joinClasses("font-display text-lg", titleClassName)}>{title}</h4>
          <button className="admin-icon-button" type="button" onClick={onClose} aria-label="Đóng modal">
            &times;
          </button>
        </div>
        <div className={joinClasses("admin-modal-body", bodyClassName)}>{children}</div>
        {footer && <div className={joinClasses("admin-modal-footer", footerClassName)}>{footer}</div>}
      </div>
    </div>
  );
}
