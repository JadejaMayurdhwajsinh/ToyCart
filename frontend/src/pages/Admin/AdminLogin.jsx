import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Block non-admin users
      if (data.user?.role !== "admin") {
        setError("Access denied. Admin accounts only.");
        setLoading(false);
        return;
      }

      // Save token + user to localStorage
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      navigate("/admin/dashboard");

    } catch (err) {
      setError("Cannot connect to server. Make sure your backend is running on port 5000.");
    }

    setLoading(false);
  };

  return (
    <div className="admin-login-bg">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="logo-icon">🛒</span>
          <h1>ToyCart Admin</h1>
        </div>
        <p className="admin-login-sub">Sign in to manage your store</p>

        {error && <div className="admin-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@toycart.com"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
            />
          </div>
          <div className="admin-form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="admin-login-hint">
          Demo: admin@toycart.com / admin123
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
