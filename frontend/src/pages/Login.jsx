import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = window.location.port === "5173"
  ? "http://localhost:8000"
  : "";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  backgroundColor: "#080C14",
  border: "1px solid #1E2D45",
  borderRadius: "6px",
  color: "#94A3B8",
  fontSize: "13px",
  fontFamily: "'DM Mono', monospace",
  outline: "none",
  boxSizing: "border-box",
};

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (isRegister) {
        await axios.post(`${BASE_URL}/auth/register`, form);
        setIsRegister(false);
        setError("Registered successfully. Please login.");
        return;
      }

      const res = await axios.post(`${BASE_URL}/auth/login/json`, {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("ims_token", res.data.access_token);
      localStorage.setItem("ims_username", res.data.username);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080C14",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{
        backgroundColor: "#0D1521",
        border: "1px solid #1E2D45",
        borderRadius: "8px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
      }}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444", boxShadow: "0 0 8px #EF4444" }} />
            <span style={{ fontSize: "11px", color: "#475569", letterSpacing: "0.15em" }}>IMS</span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#F1F5F9" }}>
            {isRegister ? "Create Account" : "Sign In"}
          </h1>
          <p style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
            {isRegister ? "Register to access the dashboard" : "Sign in to access the dashboard"}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>Username</div>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#3B82F6"}
              onBlur={e => e.target.style.borderColor = "#1E2D45"}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {isRegister && (
            <div>
              <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>Email</div>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#3B82F6"}
                onBlur={e => e.target.style.borderColor = "#1E2D45"}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>
          )}

          <div>
            <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>Password</div>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#3B82F6"}
              onBlur={e => e.target.style.borderColor = "#1E2D45"}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {error && (
            <div style={{ fontSize: "12px", color: error.includes("successfully") ? "#10B981" : "#EF4444", padding: "10px", backgroundColor: error.includes("successfully") ? "#001A0F" : "#1F0A0A", borderRadius: "6px", border: `1px solid ${error.includes("successfully") ? "#10B98133" : "#EF444433"}` }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ backgroundColor: "#1E3A5F", color: "#3B82F6", border: "1px solid #3B82F644", padding: "12px", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", fontSize: "11px", letterSpacing: "0.12em", fontFamily: "'DM Mono', monospace", fontWeight: "600", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "PROCESSING..." : isRegister ? "CREATE ACCOUNT →" : "SIGN IN →"}
          </button>

          <div style={{ textAlign: "center", fontSize: "12px", color: "#475569" }}>
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Mono', monospace", marginLeft: "6px" }}
            >
              {isRegister ? "Sign in" : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}