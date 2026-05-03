import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import IncidentDetail from "./pages/IncidentDetail";
import RCAForm from "./pages/RCAForm";
import Login from "./pages/Login";
import "./index.css";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("ims_token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const username = localStorage.getItem("ims_username");

  const handleLogout = () => {
    localStorage.removeItem("ims_token");
    localStorage.removeItem("ims_username");
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <div style={{ minHeight: "100vh", backgroundColor: "#080C14", color: "#E2E8F0", fontFamily: "'DM Mono', 'Courier New', monospace" }}>
              <header style={{ borderBottom: "1px solid #1E2D45", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#080C14", position: "sticky", top: 0, zIndex: 100 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444", boxShadow: "0 0 8px #EF4444", animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "0.15em", textTransform: "uppercase", color: "#94A3B8" }}>IMS</span>
                  <span style={{ color: "#1E2D45" }}>|</span>
                  <span style={{ fontSize: "13px", color: "#64748B", letterSpacing: "0.05em" }}>Incident Management System</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "11px", color: "#475569", fontFamily: "'DM Mono', monospace" }}>{username}</span>
                  <button
                    onClick={handleLogout}
                    style={{ background: "none", color: "#475569", border: "1px solid #1E2D45", padding: "4px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "10px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}
                  >
                    LOGOUT
                  </button>
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
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;