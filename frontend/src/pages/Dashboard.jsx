import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import Toast from "../components/Toast";
import useToast from "../components/useToast";
import { formatLocalDate } from "../utils/formatDate";
import IncidentRow from "../components/IncidentRow";

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
  const [wsConnected, setWsConnected] = useState(false);
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const { toast, showToast, hideToast } = useToast();

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

  const connectWebSocket = () => {
    const WS_URL = window.location.port === "5173"
      ? "ws://localhost:8000/ws/incidents"
      : `ws://${window.location.host}/ws/incidents`;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      console.log("[WS] Connected");
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "NEW_INCIDENT") {
        showToast(
          `New ${data.priority} incident: ${data.component_id}`,
          data.priority === "P0" ? "error" : data.priority === "P1" ? "warning" : "info"
        );
        await fetchIncidents();
      }

      if (data.type === "STATUS_UPDATED") {
        showToast(`Incident status updated to ${data.new_status}`, "success");
        await fetchIncidents();
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log("[WS] Disconnected — reconnecting in 3s...");
      // Auto reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      ws.close();
    };
  };

  useEffect(() => {
    fetchIncidents();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
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
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#F1F5F9", letterSpacing: "-0.02em" }}>Live Incident Feed</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: wsConnected ? "#10B981" : "#EF4444", boxShadow: wsConnected ? "0 0 6px #10B981" : "0 0 6px #EF4444" }} />
              <span style={{ fontSize: "10px", color: wsConnected ? "#10B981" : "#EF4444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
                {wsConnected ? "LIVE" : "RECONNECTING"}
              </span>
            </div>
            {lastUpdated && (
              <span style={{ fontSize: "11px", color: "#334155", fontFamily: "'DM Mono', monospace" }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
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
                <IncidentRow key={incident.id} incident={incident} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}