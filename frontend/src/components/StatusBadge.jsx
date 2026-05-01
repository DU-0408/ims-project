export function StatusBadge({ status }) {
  const config = {
    OPEN: { color: "#EF4444", bg: "#1F0A0A", label: "OPEN" },
    INVESTIGATING: { color: "#F59E0B", bg: "#1A1200", label: "INVESTIGATING" },
    RESOLVED: { color: "#10B981", bg: "#001A0F", label: "RESOLVED" },
    CLOSED: { color: "#475569", bg: "#0F1623", label: "CLOSED" },
  };
  const c = config[status] || config.OPEN;
  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.color,
      border: `1px solid ${c.color}33`,
      padding: "3px 10px",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: "600",
      letterSpacing: "0.12em",
      fontFamily: "'DM Mono', monospace",
    }}>
      {c.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const config = {
    P0: { color: "#EF4444", bg: "#1F0A0A", glow: "#EF444444" },
    P1: { color: "#F59E0B", bg: "#1A1200", glow: "#F59E0B44" },
    P2: { color: "#3B82F6", bg: "#0A0F1F", glow: "#3B82F644" },
  };
  const c = config[priority] || config.P2;
  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.color,
      border: `1px solid ${c.color}55`,
      padding: "3px 10px",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: "700",
      letterSpacing: "0.12em",
      fontFamily: "'DM Mono', monospace",
      boxShadow: `0 0 8px ${c.glow}`,
    }}>
      {priority}
    </span>
  );
}