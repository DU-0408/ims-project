import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { color: "#10B981", bg: "#001A0F", border: "#10B98133" },
    error: { color: "#EF4444", bg: "#1F0A0A", border: "#EF444433" },
    warning: { color: "#F59E0B", bg: "#1A1200", border: "#F59E0B33" },
    info: { color: "#3B82F6", bg: "#0A1929", border: "#3B82F633" },
  };

  const c = config[type] || config.info;

  return (
    <div style={{
      position: "fixed",
      bottom: "32px",
      right: "32px",
      zIndex: 9999,
      backgroundColor: c.bg,
      border: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.color}`,
      borderRadius: "6px",
      padding: "16px 20px",
      minWidth: "300px",
      maxWidth: "420px",
      animation: "fadeIn 0.2s ease",
      boxShadow: `0 4px 24px ${c.border}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "10px", color: c.color, letterSpacing: "0.12em", fontFamily: "'DM Mono', monospace", marginBottom: "6px", textTransform: "uppercase" }}>
            {type === "success" ? "Success" : type === "error" ? "Error" : type === "warning" ? "Warning" : "Info"}
          </div>
          <div style={{ fontSize: "13px", color: "#94A3B8", fontFamily: "'DM Mono', monospace", lineHeight: "1.6" }}>
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: "16px", padding: "0", lineHeight: 1, flexShrink: 0 }}
        >
          ×
        </button>
      </div>
    </div>
  );
}