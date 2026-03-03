import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const statusColors = {
  delivered:  "#22c55e",
  confirmed:  "#3b82f6",
  processing: "#f59e0b",
  shipped:    "#6366f1",
  pending:    "#94a3b8",
  cancelled:  "#ef4444",
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    fetch(`${API_URL}/api/admin/dashboard/stats`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.message || "Failed to load dashboard.");
        }
      })
      .catch(() => setError("Cannot connect to server."));
  }, []);

  if (error) return <div className="admin-loading">⚠ {error}</div>;
  if (!stats)  return <div className="admin-loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h2>Dashboard</h2>
        <span className="admin-date">
          {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {[
          { label: "Total Revenue",  value: `₹${Number(stats.totalRevenue).toLocaleString()}`,  icon: "🪙", color: "#255F83", link: "/admin/orders" },
          { label: "Products",       value: stats.totalProducts,   icon: "🧸", color: "#b89ef8", link: "/admin/products" },
          { label: "Orders",         value: stats.totalOrders,     icon: "📦", color: "#c8d800", link: "/admin/orders" },
          { label: "Customers",      value: stats.totalCustomers,  icon: "🎈", color: "#d88a96", link: "/admin/customers" },
        ].map((stat) => (
          <Link to={stat.link} key={stat.label} className="stat-card" style={{ "--accent": stat.color }}>
            <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <div className="section-header">
          <h3>Recent Orders</h3>
          <Link to="/admin/orders" className="view-all-link">View all →</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders?.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td>
                    <div>{order.User?.name || "—"}</div>
                    <div className="sub-text">{order.User?.email}</div>
                  </td>
                  <td>₹{Number(order.total_amount).toLocaleString()}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        background: (statusColors[order.status] || "#94a3b8") + "22",
                        color: statusColors[order.status] || "#94a3b8",
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!stats.recentOrders?.length && (
            <div className="empty-state">No orders yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
