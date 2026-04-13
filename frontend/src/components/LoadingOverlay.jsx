export default function LoadingOverlay({
  label = "Đang chuẩn bị món ngon cho bạn...",
  variant = "inline",
  className = ""
}) {
  const variantClass = variant ? `waiter-loader--${variant}` : "";

  return (
    <div className={`waiter-loader ${variantClass} ${className}`.trim()} role="status" aria-live="polite">
      <div className="waiter-card">
        <div className="waiter-track">
          <div className="waiter-runner">
            <span className="waiter-head" />
            <span className="waiter-body" />
            <span className="waiter-apron" />
            <span className="waiter-arm waiter-arm-left" />
            <span className="waiter-arm waiter-arm-right" />
            <span className="waiter-tray" />
            <span className="waiter-leg waiter-leg-left" />
            <span className="waiter-leg waiter-leg-right" />
          </div>
          <span className="waiter-shadow" />
          <span className="waiter-floor" />
        </div>
        <div className="waiter-copy">
          <p className="waiter-title">Đang phục vụ...</p>
          <p className="waiter-subtitle">{label}</p>
        </div>
      </div>
    </div>
  );
}
