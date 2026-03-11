import "./ToyBox.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import APIService from "../../services/api";
import { useCart } from "../../hooks/useCart";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EmptyCart = () => (
  <div className="toybox-empty-state">
    <div className="toybox-empty-illustration">
      <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="160" cy="200" rx="130" ry="40" fill="#DECCFE" opacity="0.35" />
        <ellipse cx="80" cy="80" rx="50" ry="50" fill="#F7FFB4" opacity="0.5" />
        <ellipse cx="250" cy="60" rx="35" ry="35" fill="#EDC2C9" opacity="0.45" />
        <rect x="60" y="100" width="190" height="120" rx="18" fill="white" stroke="#DECCFE" strokeWidth="3"/>
        <path d="M40 70 Q40 50 60 50 L80 50" stroke="#b89ef8" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <circle cx="40" cy="70" r="8" fill="#b89ef8"/>
        <rect x="75" y="115" width="160" height="90" rx="12" fill="#F8F5FF"/>
        <circle cx="130" cy="152" r="5" fill="#b89ef8"/>
        <circle cx="180" cy="152" r="5" fill="#b89ef8"/>
        <path d="M140 175 Q155 165 170 175" stroke="#b89ef8" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <circle cx="100" cy="228" r="14" fill="white" stroke="#DECCFE" strokeWidth="3"/>
        <circle cx="100" cy="228" r="6" fill="#b89ef8"/>
        <circle cx="210" cy="228" r="14" fill="white" stroke="#DECCFE" strokeWidth="3"/>
        <circle cx="210" cy="228" r="6" fill="#b89ef8"/>
        <text x="22" y="45" fontSize="18" opacity="0.7">✦</text>
        <text x="270" y="100" fontSize="14" opacity="0.6">✦</text>
        <text x="255" y="170" fontSize="10" opacity="0.5">✦</text>
        <text x="248" y="48" fontSize="22">🧸</text>
        <text x="30" y="140" fontSize="18">🎀</text>
        <text x="270" y="195" fontSize="16">⭐</text>
      </svg>
    </div>
    <h3 className="toybox-empty-title">Your toy box is empty!</h3>
    <p className="toybox-empty-desc">Looks like you haven't added any toys yet.<br/>Let's fix that! 🎉</p>
  </div>
);

function ToyBox() {
    const navigate = useNavigate();
    const { syncCart } = useCart(); // ← pull syncCart to keep navbar in sync

    const [cartItems, setCartItems] = useState([]);
    const [loading,   setLoading]   = useState(false);
    const [error,     setError]     = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;

    const fetchCart = async () => {
        if (!token) { setCartItems([]); return; }
        try {
            setLoading(true);
            setError("");
            const data = await APIService.getCart(token);
            const mapped = (data.items || []).map((item) => ({
                id:        item.id,
                cartId:    item.id,
                productId: item.productId,
                name:      item.Product?.name,
                image:     item.Product?.image_url
                    ? item.Product.image_url.startsWith("http")
                        ? item.Product.image_url
                        : `${API_BASE}${item.Product.image_url}`
                    : null,
                price:    item.Product?.price,
                quantity: item.quantity,
            }));
            setCartItems(mapped);
        } catch {
            setError("Unable to load your toy box. Please login again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCart(); }, []);

    const handleQuantityChange = async (cartId, newQty) => {
        if (!token || newQty < 1) return;
        try {
            await APIService.updateCartItem(cartId, newQty, token);
            // update local state + sync navbar badge together
            await fetchCart();
            await syncCart();
        } catch {
            setError("Could not update quantity.");
        }
    };

    const handleRemove = async (cartId) => {
        if (!token) return;
        try {
            await APIService.removeCartItem(cartId, token);
            // update local state + sync navbar badge together
            await fetchCart();
            await syncCart();
        } catch {
            setError("Could not remove item.");
        }
    };

    const totalPrice = useMemo(
        () => cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0),
        [cartItems]
    );

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <section className="toybox-section">
            <div className="toybox-content">

                {/* ── Header ── */}
                <div className="toybox-header">
                    <h2>Your toy box</h2>
                    {cartItems.length > 0 && (
                        <span className="toybox-item-count">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
                    )}
                </div>

                {loading && <p className="toybox-status">Loading your toy box...</p>}
                {error && !loading && <p className="toybox-status toybox-error">{error}</p>}

                {/* ── Empty State ── */}
                {!loading && cartItems.length === 0 && !error && (
                    <div className="toybox-empty-wrap">
                        <EmptyCart />
                        <a href="/Alltoys" className="toybox-empty-btn">Browse Toys 🧸</a>
                    </div>
                )}

                {/* ── Table ── */}
                {cartItems.length > 0 && (
                    <table className="toybox-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => (
                                <tr key={item.cartId}>
                                    <td className="product-cell">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="product-image" />
                                        ) : (
                                            <div className="product-image-placeholder">🧸</div>
                                        )}
                                        <span className="product-name">{item.name}</span>
                                    </td>
                                    <td className="price-cell">₹{Number(item.price).toLocaleString()}</td>
                                    <td className="quantity-cell">
                                        <button
                                            className="qty-btn qty-minus"
                                            onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >−</button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            readOnly
                                            className="qty-input"
                                        />
                                        <button
                                            className="qty-btn qty-plus"
                                            onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                                        >+</button>
                                    </td>
                                    <td className="subtotal-cell">
                                        ₹{(Number(item.price) * item.quantity).toLocaleString()}
                                    </td>
                                    <td className="action-cell">
                                        <button
                                            className="remove-btn"
                                            onClick={() => handleRemove(item.cartId)}
                                        >✕ Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* ── Footer ── */}
                {cartItems.length > 0 && (
                    <div className="toybox-footer">
                        <a href="/Alltoys" className="continue-shopping">← Continue Shopping</a>
                        <div className="toybox-summary">
                            <div className="toybox-summary-row">
                                <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                                <span>₹{totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="toybox-summary-row">
                                <span>Shipping</span>
                                <span className="toybox-free">FREE</span>
                            </div>
                            <div className="toybox-summary-divider" />
                            <div className="toybox-summary-row toybox-summary-total">
                                <span>Total</span>
                                <span>₹{totalPrice.toLocaleString()}</span>
                            </div>
                            <button className="checkout-btn" onClick={() => navigate("/Checkout")}>
                                Proceed to Checkout →
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
}

export default ToyBox;
