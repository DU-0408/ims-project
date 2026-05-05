import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import Toast from "../components/Toast";
import useToast from "../components/useToast";
import { formatLocalDate } from "../utils/formatDate";

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchIncident = async () => {
    try {
      const res = await client.get(`/incidents/${id}`);
      setIncident(res.data);
    } catch (err) {
      console.error("Failed to fetch incident", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async () => {
    setTransitioning(true);
    try {
      await client.patch(`/incidents/${id}/status`, { status: "next" });
      await fetchIncident();
    } catch (err) {
      showToast(err.response?.data?.detail || "Transition failed", "warning");
    } finally {
      setTransitioning(false);
    }
  };

  useEffect(() => { fetchIncident(); }, [id]);

  if (loading) return <div style={{ color: "#475569", fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>Loading...</div>;
  if (!incident) return <div style={{ color: "#EF4444" }}>Incident not found.</div>;

  const metaFields = [
    { label: "Incident ID", value: incident.id },
    { label: "Component", value: incident.component_id },
    { label: "Signal Count", value: incident.signal_count },
    { label: "Started", value: formatLocalDate(incident.start_time) },
    { label: "Last Updated", value: formatLocalDate(incident.updated_at) },
    { label: "MTTR", value: incident.mttr_minutes ? `${incident.mttr_minutes.toFixed(2)} min` : "Pending" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: "1100px" }}>
      <button
        onClick={() => navigate("/")}
        style={{ background: "none", color: "#475569", border: "none", padding: "0 0 24px", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "6px" }}
      >
        ← BACK TO FEED
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
        <PriorityBadge priority={incident.priority} />
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#F1F5F9", letterSpacing: "-0.02em", fontFamily: "'DM Sans', sans-serif" }}>{incident.component_id}</h1>
        <StatusBadge status={incident.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1px", backgroundColor: "#1E2D45", border: "1px solid #1E2D45", borderRadius: "8px", overflow: "hidden", marginBottom: "32px" }}>
        {metaFields.map(({ label, value }) => (
          <div key={label} style={{ backgroundColor: "#0D1521", padding: "16px 20px" }}>
            <div style={{ fontSize: "10px", color: "#334155", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "13px", color: "#94A3B8", fontFamily: "'DM Mono', monospace", wordBreak: "break-all" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "40px", flexWrap: "wrap" }}>
        {incident.status !== "CLOSED" && (
          <button
            onClick={handleTransition}
            disabled={transitioning}
            style={{ backgroundColor: "#0D1521", color: "#F59E0B", border: "1px solid #F59E0B44", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", transition: "all 0.15s", opacity: transitioning ? 0.5 : 1 }}
          >
            {transitioning ? "PROCESSING..." : "ADVANCE STATUS →"}
          </button>
        )}
        {(incident.status === "RESOLVED" || incident.status === "INVESTIGATING") && (
          <button
            onClick={() => navigate(`/incidents/${id}/rca`)}
            style={{ backgroundColor: "#0A1929", color: "#3B82F6", border: "1px solid #3B82F644", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", transition: "all 0.15s" }}
          >
            FILE RCA
          </button>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: "13px", color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "16px", fontWeight: "500" }}>Raw Signal Log</h2>
        {!incident.signals || incident.signals.length === 0 ? (
          <div style={{ color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: "13px", padding: "32px 0" }}>No signals linked to this incident.</div>
        ) : (
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
                {incident.signals.map((signal, i) => (
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
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}