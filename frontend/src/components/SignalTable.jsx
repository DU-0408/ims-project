import { formatLocalDate } from "../utils/formatDate";

export default function SignalTable({ signals }) {
  if (!signals || signals.length === 0) {
    return <div style={{ color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: "13px", padding: "32px 0" }}>No signals linked to this incident.</div>;
  }

  return (
    <div style={{ border: "1px solid #1E2D45", borderRadius: "8px", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#0D1521", borderBottom: "1px solid #1E2D45" }}>
            {["Signal ID", "Error Message", "Severity", "Timestamp"].map(h => (
              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", color: "#334155", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: "500" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {signals.map((signal, i) => (
            <tr key={signal.signal_id || i} style={{ borderBottom: "1px solid #0F1623", backgroundColor: i % 2 === 0 ? "#080C14" : "#0A0F1A" }}>
              <td style={{ padding: "12px 16px", fontSize: "11px", fontFamily: "'DM Mono', monospace", color: "#334155" }}>{signal.signal_id?.slice(0, 8)}...</td>
              <td style={{ padding: "12px 16px", fontSize: "12px", fontFamily: "'DM Mono', monospace", color: "#94A3B8" }}>{signal.error_message}</td>
              <td style={{ padding: "12px 16px" }}>
                <span style={{ fontSize: "10px", color: "#EF4444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{signal.severity}</span>
              </td>
              <td style={{ padding: "12px 16px", fontSize: "11px", fontFamily: "'DM Mono', monospace", color: "#475569" }}>{formatLocalDate(signal.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}