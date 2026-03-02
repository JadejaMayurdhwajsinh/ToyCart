import { useEffect, useState } from "react";
import "./Admin.css";
import APIService from "../../services/api";

const statusColors = {
  delivered: "#22c55e", processing: "#f59e0b",
  shipped: "#3b82f6", pending: "#94a3b8", cancelled: "#ef4444",
};

const AdminCustomers = () => {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (search) params.search = search;
      const data = await APIService.getAdminCustomers(params, token);
      const list = (data.customers || []).map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || "",
        joinDate: new Date(c.createdAt).toISOString().slice(0, 10),
      }));
      setCustomers(list);
    } catch (err) {
      setError("Unable to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCustomer = async (customer) => {
    try {
      setError("");
      const data = await APIService.getAdminCustomerDetail(customer.id, token);
      const orders = (data.orders || []).map((o) => ({
        id: o.id,
        date: new Date(o.createdAt).toISOString().slice(0, 10),
        amount: Number(o.total_amount || 0),
        status: o.status,
      }));

      setSelected({
        id: data.customer.id,
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone || "",
        joinDate: new Date(data.customer.createdAt).toISOString().slice(0, 10),
        totalOrders: data.totalOrders || orders.length,
        totalSpend: data.totalSpent || 0,
        orders,
      });
    } catch (err) {
      setError("Unable to load customer details.");
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      setLoading(true);
      setError("");
      await APIService.deleteAdminCustomer(deleteConfirm, token);
      await loadCustomers();
      setSelected(null);
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || "Unable to delete customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Customers</h2>
        <span className="admin-count">{filtered.length} registered</span>
      </div>

      {error && <p style={{ color: "#c00", marginBottom: "12px" }}>{error}</p>}

      <div className="admin-filters">
        <input
          className="admin-search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        {loading && <div className="admin-loading">Loading customers...</div>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Orders</th>
              <th>Total Spend</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <div className="customer-cell">
                    <div className="customer-avatar">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <div>{customer.name}</div>
                      <div className="sub-text">{customer.email}</div>
                    </div>
                  </div>
                </td>
                <td>{customer.phone}</td>
                <td>{customer.joinDate}</td>
                <td>—</td>
                <td>—</td>
                <td>
                  <button className="admin-btn-edit" onClick={() => openCustomer(customer)}>
                    View History
                  </button>
                  <button 
                    className="admin-btn-delete" 
                    onClick={() => setDeleteConfirm(customer.id)}
                    style={{ marginLeft: "8px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No customers found.</div>}
      </div>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Profile</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="customer-profile">
              <div className="customer-avatar large">{selected.name.charAt(0)}</div>
              <div>
                <h3>{selected.name}</h3>
                <p className="sub-text">{selected.email}</p>
                <p className="sub-text">{selected.phone}</p>
                <p className="sub-text">Member since {selected.joinDate}</p>
              </div>
            </div>

            <div className="customer-stats-row">
              <div className="cust-stat">
                <div className="stat-value">{selected.totalOrders}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="cust-stat">
                <div className="stat-value">₹{selected.totalSpend.toLocaleString()}</div>
                <div className="stat-label">Total Spent</div>
              </div>
            </div>

            <div className="order-items">
              <h4>Order History</h4>
              {selected.orders.map((order) => (
                <div key={order.id} className="order-item-row">
                  <span className="order-id">{order.id}</span>
                  <span>{order.date}</span>
                  <span>₹{order.amount.toLocaleString()}</span>
                  <span
                    className="status-badge"
                    style={{ background: statusColors[order.status] + "22", color: statusColors[order.status] }}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="modal-actions" style={{ marginTop: "20px" }}>
              <button className="admin-btn-secondary" onClick={() => setSelected(null)}>Close</button>
              <button 
                className="admin-btn-delete" 
                onClick={() => setDeleteConfirm(selected.id)}
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => !loading && setDeleteConfirm(null)}>
          <div className="admin-modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Customer?</h3>
            <p>This will permanently remove the customer account. This action cannot be undone.</p>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
              Note: Customer can only be deleted if they have no active orders (pending, processing, or shipped).
            </p>
            <div className="modal-actions">
              <button 
                className="admin-btn-secondary" 
                onClick={() => setDeleteConfirm(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="admin-btn-delete" 
                onClick={handleDeleteCustomer}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
