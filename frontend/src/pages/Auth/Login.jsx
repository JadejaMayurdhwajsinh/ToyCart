import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import APIService from "../../services/api";
import "../Admin/Admin.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await APIService.login(form.email, form.password);
      const role = data?.user?.role;

      if (role === "admin") {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));
        navigate("/admin/dashboard");
      } else if (role === "customer") {
        localStorage.setItem("customerToken", data.token);
        const from = location.state?.from || "/";
        navigate(from);
      } else {
        setError("Invalid user role.");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
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
        <p className="admin-login-sub">Sign in to your ToyCart account</p>

        {error && <div className="admin-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange("email")}
              required
            />
          </div>
          <div className="admin-form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange("password")}
              required
            />
          </div>
        <p style={{ textAlign: "right", marginTop: "5px", fontSize: "13px" }}>
          <Link to="/forgot-password" style={{ color: "#255F83", fontWeight: 700 }}>
            Forgot password?
          </Link>
        </p>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>


        <p className="admin-login-hint">
          New here? <Link to="/register">Create a ToyCart account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
