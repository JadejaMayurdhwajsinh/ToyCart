import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import APIService from "../../services/api";
import "../Admin/Admin.css";

export default function ResetPassword() {
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get("token");
  const navigate        = useNavigate();

  const [form,    setForm]    = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [err,     setErr]     = useState("");

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(""); setErr("");
    try {
      await APIService.resetPassword({ token, ...form });
      setMsg("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErr(error.message || "Invalid or expired link. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="admin-login-bg">
      <div className="admin-login-card">
        <p style={{ color: "#ef4444", textAlign: "center", fontWeight: 700 }}>
          Invalid reset link. <Link to="/forgot-password">Request a new one</Link>
        </p>
      </div>
    </div>
  );

  return (
    <div className="admin-login-bg">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="logo-icon">🧸</span>
          <h1>ToyCart</h1>
        </div>
        <p className="admin-login-sub">Set a new password</p>

        {msg && (
          <div style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", fontWeight: 700, marginBottom: "16px", textAlign: "center" }}>
            {msg} Redirecting to login...
          </div>
        )}
        {err && <div className="admin-error-msg">{err}</div>}

        {!msg && (
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                required
              />
            </div>
            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
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
