import { C } from "../constants/colors";

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white, borderRadius: 14, padding: "24px 28px",
          width: "100%", maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: C.bg, color: C.text, border: `1.5px solid ${C.border}`,
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: danger ? C.red : C.primary,
              color: C.white, border: "none", cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}