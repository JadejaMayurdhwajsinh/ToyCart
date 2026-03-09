import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "./Admin.css";

const BAR_COLORS = ["#DECCFE", "#F7FFB4", "#EDC2C9", "#b89ef8", "#c8d800", "#255F83", "#f59e0b"];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_COLORS = {
  delivered:  "#22c55e",
  confirmed:  "#3b82f6",
  processing: "#f59e0b",
  shipped:    "#6366f1",
  pending:    "#94a3b8",
  cancelled:  "#ef4444",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#fff", border: "2px solid #DECCFE",
        borderRadius: 12, padding: "10px 16px",
        fontFamily: "Nunito, sans-serif",
        boxShadow: "0 4px 16px rgba(37,95,131,0.1)"
      }}>
        <p style={{ margin: 0, fontWeight: 800, color: "#255F83", fontSize: 13 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: "4px 0 0", fontWeight: 700, color: p.color, fontSize: 13 }}>
            {p.name === "revenue" ? `₹${Number(p.value).toLocaleString()}` : `${p.value} orders`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#fff", border: "2px solid #DECCFE",
        borderRadius: 12, padding: "10px 16px",
        fontFamily: "Nunito, sans-serif",
        boxShadow: "0 4px 16px rgba(37,95,131,0.1)"
      }}>
        <p style={{ margin: 0, fontWeight: 800, color: "#255F83", fontSize: 13, textTransform: "capitalize" }}>
          {payload[0].name}
        </p>
        <p style={{ margin: "4px 0 0", fontWeight: 700, color: payload[0].payload.color, fontSize: 13 }}>
          {payload[0].value} order{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats,      setStats]      = useState(null);
  const [error,      setError]      = useState("");
  const [chartData,  setChartData]  = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [chartView,  setChartView]  = useState("revenue");
  const [pdfLoading, setPdfLoading] = useState(false);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetch(`${API_URL}/api/admin/dashboard/stats`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          buildChartData(data.stats.recentOrders || []);
          buildStatusData(data.stats.recentOrders || []);
        } else {
          setError(data.message || "Failed to load dashboard.");
        }
      })
      .catch(() => setError("Cannot connect to server."));
  }, []);

  const buildChartData = (orders) => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d,
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        revenue: 0,
        orders: 0,
      });
    }
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toDateString();
      const match = days.find(d => d.date.toDateString() === orderDate);
      if (match) {
        match.revenue += Number(order.total_amount || 0);
        match.orders  += 1;
      }
    });
    setChartData(days.map(({ label, revenue, orders }) => ({ label, revenue, orders })));
  };

  const buildStatusData = (orders) => {
    const counts = {};
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    const result = Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status] || "#94a3b8",
    }));
    setStatusData(result);
  };

  const downloadPDF = async () => {
    try {
      setPdfLoading(true);
      const { default: jsPDF }     = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      const now = new Date();
      const monthName = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

      doc.setFillColor(37, 95, 131);
      doc.rect(0, 0, 210, 36, "F");
      doc.setTextColor(247, 255, 180);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("ToyCart", 14, 16);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Monthly Sales Report", 14, 26);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(monthName, 196, 16, { align: "right" });
      doc.text(`Generated: ${now.toLocaleDateString("en-IN")}`, 196, 26, { align: "right" });

      doc.setTextColor(37, 95, 131);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, 48);

      const summaryItems = [
        { label: "Total Revenue", value: `Rs. ${Number(stats.totalRevenue).toLocaleString()}` },
        { label: "Total Orders",  value: String(stats.totalOrders) },
        { label: "Products",      value: String(stats.totalProducts) },
        { label: "Customers",     value: String(stats.totalCustomers) },
      ];

      const cardW = 43, cardH = 22, startX = 14, startY = 52, gap = 4;
      summaryItems.forEach((item, i) => {
        const x = startX + i * (cardW + gap);
        doc.setFillColor(240, 248, 255);
        doc.roundedRect(x, startY, cardW, cardH, 3, 3, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 120, 140);
        doc.text(item.label, x + 4, startY + 7);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(37, 95, 131);
        doc.text(item.value, x + 4, startY + 17);
      });

      doc.setTextColor(37, 95, 131);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Revenue - Last 7 Days", 14, 90);

      autoTable(doc, {
        startY: 94,
        head: [["Date", "Revenue (Rs.)", "Orders"]],
        body: chartData.map(d => [d.label, `Rs. ${Number(d.revenue).toLocaleString()}`, d.orders]),
        styles: { font: "helvetica", fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [37, 95, 131], textColor: [247, 255, 180], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 255] },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 80 }, 2: { cellWidth: 40 } },
      });

      const afterTable = doc.lastAutoTable.finalY + 12;
      doc.setTextColor(37, 95, 131);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Recent Orders", 14, afterTable);

      autoTable(doc, {
        startY: afterTable + 4,
        head: [["Order ID", "Customer", "Email", "Amount (Rs.)", "Status", "Date"]],
        body: (stats.recentOrders || []).map(order => [
          `#${order.id}`,
          order.User?.name || "—",
          order.User?.email || "—",
          `Rs. ${Number(order.total_amount).toLocaleString()}`,
          order.status?.charAt(0).toUpperCase() + order.status?.slice(1),
          new Date(order.createdAt).toLocaleDateString("en-IN"),
        ]),
        styles: { font: "helvetica", fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [37, 95, 131], textColor: [247, 255, 180], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 255] },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(160, 170, 180);
        doc.text(`ToyCart Admin  •  Page ${p} of ${pageCount}  •  Confidential`, 105, 290, { align: "center" });
      }

      doc.save(`ToyCart-Sales-${monthName.replace(" ", "-")}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Failed to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (error)  return <div className="admin-loading">⚠ {error}</div>;
  if (!stats) return <div className="admin-loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">

      {/* ── Page header ── */}
      <div className="admin-page-header">
        <h2>Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="admin-date">
            {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
          </span>
          <button className="pdf-download-btn" onClick={downloadPDF} disabled={pdfLoading}>
            {pdfLoading ? "⏳ Generating..." : "📄 Download Monthly Report"}
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        {[
          { label: "Total Revenue", value: `₹${Number(stats.totalRevenue).toLocaleString()}`, icon: "🪙", color: "#255F83", link: "/admin/orders" },
          { label: "Products",      value: stats.totalProducts,  icon: "🧸", color: "#b89ef8", link: "/admin/products" },
          { label: "Orders",        value: stats.totalOrders,    icon: "📦", color: "#c8d800", link: "/admin/orders" },
          { label: "Customers",     value: stats.totalCustomers, icon: "🎈", color: "#d88a96", link: "/admin/customers" },
        ].map(stat => (
          <Link to={stat.link} key={stat.label} className="stat-card" style={{ "--accent": stat.color }}>
            <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Revenue Chart ── */}
      <div className="admin-section chart-section">
        <div className="section-header">
          <h3>Last 7 Days</h3>
          <div className="chart-toggle">
            <button className={`chart-toggle-btn ${chartView === "revenue" ? "active" : ""}`} onClick={() => setChartView("revenue")}>Revenue</button>
            <button className={`chart-toggle-btn ${chartView === "orders"  ? "active" : ""}`} onClick={() => setChartView("orders")}>Orders</button>
          </div>
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            {chartView === "revenue" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#DECCFE" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F7FFB4" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fontFamily: "Nunito", fill: "#7a8aaa" }} />
                <YAxis tick={{ fontSize: 12, fontFamily: "Nunito", fill: "#7a8aaa" }} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="bump"
                  dataKey="revenue"
                  stroke="#b89ef8"
                  strokeWidth={4}
                  fill="url(#revenueGrad)"
                  dot={{ fill: "#F7FFB4", stroke: "#b89ef8", strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 9, fill: "#255F83" }}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fontFamily: "Nunito", fill: "#7a8aaa" }} />
                <YAxis tick={{ fontSize: 12, fontFamily: "Nunito", fill: "#7a8aaa" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" radius={[12, 12, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Order Status Breakdown ── */}
      <div className="admin-section chart-section">
        <div className="section-header">
          <h3>Order Status Breakdown</h3>
          {statusData.length > 0 && (
            <span style={{ fontSize: 13, color: "#7a8aaa", fontWeight: 700 }}>
              {statusData.reduce((a, b) => a + b.value, 0)} total orders
            </span>
          )}
        </div>
        {statusData.length > 0 ? (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={6}
                  dataKey="value"
                  strokeWidth={3}
                  stroke="#fff"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontFamily: "Nunito", fontWeight: 700, fontSize: 13, color: "#255F83", textTransform: "capitalize" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#7a8aaa", fontWeight: 700 }}>
            No order data yet 📦
          </div>
        )}
      </div>

      {/* ── Recent Orders ── */}
      <div className="admin-section">
        <div className="section-header">
          <h3>Recent Orders</h3>
          <Link to="/admin/orders" className="view-all-link">View all →</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders?.map(order => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td>
                    <div>{order.User?.name || "—"}</div>
                    <div className="sub-text">{order.User?.email}</div>
                  </td>
                  <td>₹{Number(order.total_amount).toLocaleString()}</td>
                  <td>
                    <span className="status-badge" style={{
                      background: (STATUS_COLORS[order.status] || "#94a3b8") + "22",
                      color: STATUS_COLORS[order.status] || "#94a3b8",
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!stats.recentOrders?.length && <div className="empty-state">No orders yet.</div>}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
