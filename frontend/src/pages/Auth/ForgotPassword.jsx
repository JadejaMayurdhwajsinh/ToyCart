import { useState } from "react";
import { Link } from "react-router-dom";
import APIService from "../../services/api";
import "../Admin/Admin.css";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [err,     setErr]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(""); setErr("");
    try {
      await APIService.forgotPassword(email);
      setMsg("If that email exists, a reset link has been sent. Check your inbox!");
    } catch (error) {
      setErr(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-bg">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="logo-icon">🧸</span>
          <h1>ToyCart</h1>
        </div>
        <p className="admin-login-sub">Forgot your password?</p>
        <p style={{ color: "#7a8aaa", fontSize: "13px", marginBottom: "20px", textAlign: "center" }}>
          Enter your email and we'll send you a reset link.
        </p>

        {msg && (
          <div style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", fontWeight: 700, marginBottom: "16px" }}>
            {msg}
          </div>
        )}
        {err && <div className="admin-error-msg">{err}</div>}

        {!msg && (
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="admin-login-hint" style={{ marginTop: "16px" }}>
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
