import { useState, useEffect } from "react";
import "./Admin.css";
import APIService from "../../services/api";

const emptyProduct = {
  id: null,
  name: "",
  categoryId: "",
  price: "",
  stock: "",
  image_url: "",
  image: null,
  imagePreview: null,
  description: "",
  short_description: "",
  is_featured: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`; // change port if needed
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [prodRes, catRes] = await Promise.all([
        APIService.getAdminProducts({}, token),
        APIService.getAdminCategories(token),
      ]);

      setProducts((prodRes.products || []).map((p) => ({
        ...p,
        categoryName: p.Category?.name || "Uncategorized",  
      })));

      setCategories((catRes.categories || []).map((c) => ({
        id: c.id,
        name: c.name,
      })));
    } catch (err) {
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      filterCategory === "All" || p.categoryId === Number(filterCategory);
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setForm(emptyProduct);
    setEditingProduct(null);
    setShowModal(true);
  };

  const openAddCategory = () => {
    setCategoryForm({ name: "", description: "" });
    setShowCategoryModal(true);
  };

  const openEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      image: null,
      imagePreview: product.image_url,
      description: product.description || "",
      short_description: product.short_description || "",
      is_featured: !!product.is_featured,
    });
    setEditingProduct(product.id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // Use FormData for file upload support
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("price", Number(form.price));
      payload.append("stock", Number(form.stock));
      payload.append("categoryId", Number(form.categoryId));
      payload.append("description", form.description);
      payload.append("short_description", form.short_description);
      payload.append("is_featured", !!form.is_featured);

      // Append file if selected
      if (form.image instanceof File) {
        payload.append("image", form.image);
      }

      if (editingProduct) {
        await APIService.updateProduct(editingProduct, payload, token);
      } else {
        await APIService.createProduct(payload, token);
      }

      await loadData();
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError("");
      await APIService.deleteProduct(id, token);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    } finally {
      setDeleteConfirm(null);
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Products</h2>
        <div className="admin-header-actions">
          <button className="admin-btn-secondary" onClick={openAddCategory}>+ Add Category</button>
          <button className="admin-btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      {error && <p style={{ color: "#c00", marginBottom: "12px" }}>{error}</p>}

      {/* Filters */}
      <div className="admin-filters">
        <input
          className="admin-search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Product Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <img
                      src={
                        getImageUrl(product.image_url) ||
                        "https://placehold.co/40x40/1a1a2e/fff?text=P"
                      }
                      alt={product.name}
                      className="product-thumb"
                    />
                    <span>{product.name}</span>
                  </div>
                </td>
                <td><span className="category-tag">{product.categoryName}</span></td>
                <td>₹{Number(product.price).toLocaleString()}</td>
                <td>
                  <span className={`stock-badge ${product.stock < 10 ? "low-stock" : ""}`}>
                    {product.stock} {product.stock < 10 ? "⚠" : ""}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="admin-btn-edit" onClick={() => openEdit(product)}>Edit</button>
                    <button className="admin-btn-delete" onClick={() => setDeleteConfirm(product.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No products found.</div>}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-row">
                <div className="admin-form-group">
                  <label>Product Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Classic Oxford Shirt" />
                </div>
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="admin-form-group">
                  <label>Price (₹) *</label>
                  <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1499" />
                </div>
                <div className="admin-form-group">
                  <label>Stock Quantity *</label>
                  <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="10" />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Product Image</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const preview = URL.createObjectURL(file);
                          setForm({ ...form, image: file, imagePreview: preview });
                        }
                      }}
                      placeholder="Select image file"
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                      Supported: PNG, JPEG, GIF, WebP (Max 5MB)
                    </small>
                  </div>
                  {form.imagePreview && (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: '1px solid #ddd',
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src={form.imagePreview}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." />
              </div>
              <div className="admin-form-group">
                <label>Short Description</label>
                <textarea rows={2} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="Short summary..." />
              </div>
              <div className="admin-form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />{" "}
                  Featured product
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">{editingProduct ? "Save Changes" : "Add Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Product?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="admin-btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="admin-btn-delete" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Category</h3>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}>✕</button>
            </div>
            <form
              className="admin-form"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setLoading(true);
                  setError("");
                  await APIService.createAdminCategory(
                    {
                      name: categoryForm.name,
                      description: categoryForm.description,
                    },
                    token
                  );
                  await loadData();
                  setShowCategoryModal(false);
                } catch (err) {
                  setError(err.message || "Unable to create category.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="admin-form-group">
                <label>Category Name *</label>
                <input
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Building Sets"
                />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Short description of this category..."
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;