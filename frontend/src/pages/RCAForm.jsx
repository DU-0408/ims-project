import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import Toast from "../components/Toast";
import useToast from "../components/useToast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ROOT_CAUSE_CATEGORIES = [
  "Network Failure", "Database Corruption", "Cache Eviction",
  "Code Bug", "Infrastructure Failure", "MCP Host Crash",
  "Queue Overflow", "Memory Leak", "Configuration Error", "Third Party Outage",
];

const fieldStyle = {
  width: "100%",
  padding: "10px 14px",
  backgroundColor: "rgba(13, 21, 33, 0.8)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid #1E2D45",
  borderRadius: "6px",
  color: "#94A3B8",
  fontSize: "13px",
  fontFamily: "'DM Mono', monospace",
  outline: "none",
  transition: "all 0.2s ease",
  boxSizing: "border-box",
};

export default function RCAForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    incident_start: null,
    incident_end: null,
    root_cause_category: "",
    fix_applied: "",
    prevention_steps: "",
  });
  const { toast, showToast, hideToast } = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.incident_start || !form.incident_end || !form.root_cause_category || !form.fix_applied || !form.prevention_steps) {
      showToast("All fields are required.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const res = await client.post(`/incidents/${id}/rca`, {
        ...form,
        incident_start: form.incident_start.toISOString(),
        incident_end: form.incident_end.toISOString(),
      });
      showToast(`RCA submitted. MTTR: ${res.data.mttr_minutes} minutes`, "success");
      setTimeout(() => navigate(`/incidents/${id}`), 2000);
    } catch (err) {
      showToast(err.response?.data?.detail || "RCA submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const Label = ({ children }) => (
    <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "8px" }}>{children}</div>
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: "720px", position: "relative" }}>
    {/* Ambient background glow */}
    <div style={{
      position: "fixed",
      top: "20%",
      left: "30%",
      width: "400px",
      height: "400px",
      backgroundColor: "#3B82F610",
      borderRadius: "50%",
      filter: "blur(80px)",
      pointerEvents: "none",
      zIndex: 0,
    }} />
    <div style={{
      position: "fixed",
      bottom: "20%",
      right: "20%",
      width: "300px",
      height: "300px",
      backgroundColor: "#EF444408",
      borderRadius: "50%",
      filter: "blur(60px)",
      pointerEvents: "none",
      zIndex: 0,
    }} />
    <div style={{ position: "relative", zIndex: 1 }}></div>
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: "720px" }}>
      <button
        onClick={() => navigate(`/incidents/${id}`)}
        style={{ background: "none", color: "#475569", border: "none", padding: "0 0 24px", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}
      >
        ← BACK TO INCIDENT
      </button>

      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#F1F5F9", letterSpacing: "-0.02em", marginBottom: "6px" }}>Root Cause Analysis</h1>
        <p style={{ fontSize: "13px", color: "#475569" }}>Complete all fields to close the incident and calculate MTTR.</p>
      </div>

      <div style={{ 
        backgroundColor: "rgba(13, 21, 33, 0.85)", 
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid #1E2D45", 
        borderRadius: "8px", 
        padding: "28px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "24px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
      }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <Label>Incident Start</Label>
            <DatePicker
              selected={form.incident_start}
              onChange={(date) => setForm({ ...form, incident_start: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMM d, yyyy HH:mm"
              placeholderText="Select start date & time"
              customInput={
                <input
                  style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = "#3B82F6"}
                  onBlur={e => e.target.style.borderColor = "#1E2D45"}
                />
              }
            />
          </div>
          <div>
            <Label>Incident End</Label>
            <DatePicker
              selected={form.incident_end}
              onChange={(date) => setForm({ ...form, incident_end: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMM d, yyyy HH:mm"
              placeholderText="Select end date & time"
              minDate={form.incident_start}
              customInput={
                <input
                  style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = "#3B82F6"}
                  onBlur={e => e.target.style.borderColor = "#1E2D45"}
                />
              }
            />
          </div>
        </div>

        <div>
          <Label>Root Cause Category</Label>
          <select name="root_cause_category" value={form.root_cause_category} onChange={handleChange}
            style={{ ...fieldStyle, cursor: "pointer" }}
          >
            <option value="">— Select category —</option>
            {ROOT_CAUSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <Label>Fix Applied</Label>
          <textarea name="fix_applied" value={form.fix_applied} onChange={handleChange} rows={4}
            placeholder="Describe the remediation steps taken..."
            style={{ ...fieldStyle, resize: "vertical", lineHeight: "1.6" }}
            onFocus={e => e.target.style.borderColor = "#3B82F6"}
            onBlur={e => e.target.style.borderColor = "#1E2D45"}
          />
        </div>

        <div>
          <Label>Prevention Steps</Label>
          <textarea name="prevention_steps" value={form.prevention_steps} onChange={handleChange} rows={4}
            placeholder="Describe measures to prevent recurrence..."
            style={{ ...fieldStyle, resize: "vertical", lineHeight: "1.6" }}
            onFocus={e => e.target.style.borderColor = "#3B82F6"}
            onBlur={e => e.target.style.borderColor = "#1E2D45"}
          />
        </div>

        <div style={{ borderTop: "1px solid #1E2D45", paddingTop: "20px" }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: "100%", backgroundColor: submitting ? "#0D1521" : "#1E3A5F", color: submitting ? "#334155" : "#3B82F6", border: "1px solid #3B82F644", padding: "14px", borderRadius: "6px", cursor: submitting ? "not-allowed" : "pointer", fontSize: "12px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", fontWeight: "600", transition: "all 0.15s" }}
          >
            {submitting ? "SUBMITTING..." : "SUBMIT RCA →"}
          </button>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
    </div>
  );
}