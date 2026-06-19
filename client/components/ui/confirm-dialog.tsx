export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "20px",
      }}
      onClick={onCancel}
    >
      <div
        className="card animate-slide-up"
        style={{ width: "100%", maxWidth: "400px", padding: "24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 12px 0", color: "var(--color-text-primary)" }}>
          {title}
        </h3>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: "0 0 24px 0" }}>
          {message}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${isDestructive ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={isLoading}
            style={{ position: "relative" }}
          >
            {isLoading ? (
              <>
                <div className="spinner spinner-white" style={{ width: "16px", height: "16px", marginRight: "8px" }} />
                {confirmLabel}...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
