import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import IncidentDetail from "./pages/IncidentDetail";
import RCAForm from "./pages/RCAForm";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", backgroundColor: "#080C14", color: "#E2E8F0", fontFamily: "'DM Mono', 'Courier New', monospace" }}>
        <header style={{ borderBottom: "1px solid #1E2D45", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#080C14", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444", boxShadow: "0 0 8px #EF4444", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "0.15em", textTransform: "uppercase", color: "#94A3B8" }}>IMS</span>
            <span style={{ color: "#1E2D45" }}>|</span>
            <span style={{ fontSize: "13px", color: "#64748B", letterSpacing: "0.05em" }}>Incident Management System</span>
          </div>
          <div style={{ fontSize: "11px", color: "#334155", letterSpacing: "0.1em" }}>
            LIVE
          </div>
        </header>
        <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            <Route path="/incidents/:id/rca" element={<RCAForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;