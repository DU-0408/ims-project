import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";

const StatCard = ({ label, value, color }) => (
  <div style={{ backgroundColor: "#0D1521", border: "1px solid #1E2D45", borderRadius: "8px", padding: "20px 24px", flex: 1 }}>
    <div style={{ fontSize: "11px", color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'DM Mono', monospace" }}>{label}</div>
    <div style={{ fontSize: "28px", fontWeight: "600", color: color || "#E2E8F0", fontFamily: "'DM Mono', monospace" }}>{value}</div>
  </div>
);

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const fetchIncidents = async () => {
    try {
      const res = await client.get("/incidents");
      setIncidents(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch incidents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const p0Count = incidents.filter(i => i.priority === "P0").length;
  const openCount = incidents.filter(i => i.status === "OPEN").length;
  const closedCount = incidents.filter(i => i.status === "CLOSED").length;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#3B82F6", animation: "pulse 1s infinite" }} />
      Fetching incidents...
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#F1F5F9", letterSpacing: "-0.02em" }}>Live Incident Feed</h1>
          {lastUpdated && (
            <span style={{ fontSize: "11px", color: "#334155", fontFamily: "'DM Mono', monospace" }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <p style={{ fontSize: "13px", color: "#475569" }}>Real-time monitoring across all infrastructure components</p>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
        <StatCard label="Total Incidents" value={incidents.length} />
        <StatCard label="Critical (P0)" value={p0Count} color={p0Count > 0 ? "#EF4444" : "#10B981"} />
        <StatCard label="Open" value={openCount} color={openCount > 0 ? "#F59E0B" : "#10B981"} />
        <StatCard label="Resolved" value={closedCount} color="#10B981" />
      </div>

      {incidents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>✓</div>
          All systems operational
        </div>
      ) : (
        <div style={{ border: "1px solid #1E2D45", borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#0D1521", borderBottom: "1px solid #1E2D45" }}>
                {["Priority", "Component", "Status", "Signals", "Started", "MTTR", "Action"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", color: "#334155", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: "500" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident, i) => (
                <tr
                  key={incident.id}
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                  style={{ borderBottom: "1px solid #0F1623", cursor: "pointer", transition: "background 0.15s", backgroundColor: i % 2 === 0 ? "#080C14" : "#0A0F1A" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0D1521"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#080C14" : "#0A0F1A"}
                >
                  <td style={{ padding: "14px 16px" }}><PriorityBadge priority={incident.priority} /></td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", fontFamily: "'DM Mono', monospace", color: "#94A3B8" }}>{incident.component_id}</td>
                  <td style={{ padding: "14px 16px" }}><StatusBadge status={incident.status} /></td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", fontFamily: "'DM Mono', monospace", color: "#64748B" }}>{incident.signal_count}</td>
                  <td style={{ padding: "14px 16px", fontSize: "12px", fontFamily: "'DM Mono', monospace", color: "#475569" }}>{new Date(incident.start_time).toLocaleString()}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}