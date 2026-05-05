import { useNavigate } from "react-router-dom";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { formatLocalDate } from "../utils/formatDate";

export default function IncidentRow({ incident, index }) {
  const navigate = useNavigate();

  return (
    <tr
      key={incident.id}
      onClick={() => navigate(`/incidents/${incident.id}`)}
      style={{ borderBottom: "1px solid #0F1623", cursor: "pointer", transition: "background 0.15s", backgroundColor: index % 2 === 0 ? "#080C14" : "#0A0F1A" }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0D1521"}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#080C14" : "#0A0F1A"}
    >
      <td style={{ padding: "14px 16px" }}><PriorityBadge priority={incident.priority} /></td>
      <td style={{ padding: "14px 16px", fontSize: "13px", fontFamily: "'DM Mono', monospace", color: "#94A3B8" }}>{incident.component_id}</td>
      <td style={{ padding: "14px 16px" }}><StatusBadge status={incident.status} /></td>
      <td style={{ padding: "14px 16px", fontSize: "13px", fontFamily: "'DM Mono', monospace", color: "#64748B" }}>{incident.signal_count}</td>
      <td style={{ padding: "14px 16px", fontSize: "12px", fontFamily: "'DM Mono', monospace", color: "#475569" }}>{formatLocalDate(incident.start_time)}</td>
      <td style={{ padding: "14px 16px", fontSize: "12px", fontFamily: "'DM Mono', monospace", color: incident.mttr_minutes ? "#10B981" : "#334155" }}>
        {incident.mttr_minutes ? `${incident.mttr_minutes.toFixed(1)}m` : "—"}
      </td>
      <td style={{ padding: "14px 16px" }}>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/incidents/${incident.id}/rca`); }}
          style={{ backgroundColor: "transparent", color: "#3B82F6", border: "1px solid #1E3A5F", padding: "5px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", transition: "all 0.15s" }}
          onMouseEnter={e => { e.target.style.backgroundColor = "#0A1929"; e.target.style.borderColor = "#3B82F6"; }}
          onMouseLeave={e => { e.target.style.backgroundColor = "transparent"; e.target.style.borderColor = "#1E3A5F"; }}
        >
          FILE RCA
        </button>
      </td>
    </tr>
  );
}