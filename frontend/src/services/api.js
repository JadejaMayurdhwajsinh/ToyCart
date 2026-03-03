// API Service - Centralized data fetching
// All frontend-network communication with the ToyCart backend should go through this layer.

const API_BASE_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5000/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || errorBody.error || 'Request failed';
    throw new Error(message);
  }
  return response.json();
}

class APIService {
  // ========== PRODUCT CATALOG ==========

  // Get all products with optional filters
  static async getProducts(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });

      const url =
        searchParams.toString().length > 0
          ? `${API_BASE_URL}/products?${searchParams.toString()}`
          : `${API_BASE_URL}/products`;

      const data = await handleResponse(await fetch(url));

      // Backend returns: { success, products, pagination }
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get single product details
  static async getProductById(id) {
    try {
      const data = await handleResponse(
        await fetch(`${API_BASE_URL}/products/${id}`)
      );

      // Backend returns: { success, product }
      return data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Get featured products (used on home/landing pages)
  static async getFeaturedProducts() {
    try {
      const data = await handleResponse(
        await fetch(`${API_BASE_URL}/products/featured/all`)
      );
      return data.products || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  // ========== AUTH HELPERS (CUSTOMER & ADMIN) ==========
  static async login(email, password) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
    );
    return data;
  }

  static async register(payload) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
    return data;
  }

  // ========== CART (AUTHENTICATED) ==========
  static async getCart(token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return data;
  }

  static async addToCart({ productId, quantity = 1 }, token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      })
    );
    return data;
  }

  static async updateCartItem(cartId, quantity, token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      })
    );
    return data;
  }

  static async removeCartItem(cartId, token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    return data;
  }

  static async clearCart(token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    return data;
  }

  // ========== ORDERS ==========
  static async placeOrder(payload, token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
    );
    return data;
  }

  static async getOrders(token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return data;
  }

  // ========== ADMIN DASHBOARD HELPERS ==========
  static async getAdminDashboardStats(token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return data;
  }

  // ========== ADMIN PRODUCTS ==========
  static async getAdminProducts(params = {}, token) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });

    const url =
      searchParams.toString().length > 0
        ? `${API_BASE_URL}/admin/products?${searchParams.toString()}`
        : `${API_BASE_URL}/admin/products`;

    const data = await handleResponse(
      await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return data;
  }

  static async getAdminCategories(token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return data;
  }

  static async createAdminCategory(payload, token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
    );
    return data;
  }

  static async createProduct(payload, token) {
    // Support both FormData (with file) and JSON payloads
    const isFormData = payload instanceof FormData;
    
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: isFormData ? payload : JSON.stringify(payload),
    };

    // Only set Content-Type for JSON, FormData sets it automatically
    if (!isFormData) {
      options.headers['Content-Type'] = 'application/json';
    }

    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/products`, options)
    );
    return data;
  }

  static async updateProduct(id, payload, token) {
    // Support both FormData (with file) and JSON payloads
    const isFormData = payload instanceof FormData;
    
    const options = {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: isFormData ? payload : JSON.stringify(payload),
    };

    // Only set Content-Type for JSON, FormData sets it automatically
    if (!isFormData) {
      options.headers['Content-Type'] = 'application/json';
    }

    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/products/${id}`, options)
    );
    return data;
  }

  static async deleteProduct(id, token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    return data;
  }

  // ========== ADMIN ORDERS ==========
  static async getAdminOrders(params = {}, token) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });

    const url =
      searchParams.toString().length > 0
        ? `${API_BASE_URL}/admin/orders?${searchParams.toString()}`
        : `${API_BASE_URL}/admin/orders`;

    const data = await handleResponse(
      await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return data;
  }

  static async getAdminOrder(orderId, token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return data;
  }

  static async updateAdminOrderStatus(orderId, payload, token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
    );
    return data;
  }

  // ========== ADMIN CUSTOMERS ==========
  static async getAdminCustomers(params = {}, token) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });

    const url =
      searchParams.toString().length > 0
        ? `${API_BASE_URL}/admin/customers?${searchParams.toString()}`
        : `${API_BASE_URL}/admin/customers`;

    const data = await handleResponse(
      await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return data;
  }

  static async getAdminCustomerDetail(userId, token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/admin/customers/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return data;
  }

  static async deleteAdminCustomer(userId, token) {
    const data = await handleResponse(
      await fetch(`${API_BASE_URL}/admin/customers/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return data;
  }
}

export default APIService;
