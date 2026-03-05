import "./ToyBox.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import APIService from "../../services/api";

function ToyBox() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;

    const fetchCart = async () => {
        if (!token) {
            setCartItems([]);
            return;
        }
        try {
            setLoading(true);
            setError("");
            const data = await APIService.getCart(token);
            console.log(data.items);
            // API returns items with nested Product
            const mapped = (data.items || []).map((item) => ({
                id: item.id,
                cartId: item.id,
                productId: item.productId,
                name: item.Product?.name,
                image: item.Product?.image_url
                    ? `http://localhost:5000${item.Product.image_url}`
                    : null,
                price: item.Product?.price,
                quantity: item.quantity,
            }));
            setCartItems(mapped);
        } catch (err) {
            setError("Unable to load your toy box. Please login again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleQuantityChange = async (cartId, newQty) => {
        if (!token) return;
        try {
            await APIService.updateCartItem(cartId, newQty, token);
            await fetchCart();
        } catch (err) {
            setError("Could not update quantity.");
        }
    };

    const handleRemove = async (cartId) => {
        if (!token) return;
        try {
            await APIService.removeCartItem(cartId, token);
            await fetchCart();
        } catch (err) {
            setError("Could not remove item.");
        }
    };

    const totalPrice = useMemo(
        () =>
            cartItems.reduce(
                (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
                0
            ),
        [cartItems]
    );

    return (
        <section className="toybox-section">
            <div className="toybox-content">
                <h2>Your toy box</h2>
                {loading && <p>Loading your toy box...</p>}
                {error && !loading && <p style={{ color: "#c00" }}>{error}</p>}
                <table className="toybox-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.length === 0 && !loading ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#255F83' }}>
                                    Your cart is empty. <a href="/Alltoys" style={{ color: '#255F83', fontWeight: 'bold' }}>Continue shopping</a>
                                </td>
                            </tr>
                        ) : (
                            cartItems.map((item) => (
                                <tr key={item.cartId}>
                                    <td className="product-cell">
                                        {item.image && (
                                            <img src={item.image} alt={item.name} className="product-image" />
                                        )}
                                        <span className="product-name">{item.name}</span>
                                    </td>
                                    <td className="price-cell">${item.price}</td>
                                    <td className="quantity-cell">
                                        <button
                                            className="qty-btn qty-minus"
                                            onClick={() => handleQuantityChange(item.cartId, Math.max(0, item.quantity - 1))}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            readOnly
                                            className="qty-input"
                                        />
                                        <button
                                            className="qty-btn qty-plus"
                                            onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </td>
                                    <td className="action-cell">
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleRemove(item.cartId)}
                                            style={{ background: '#FF6B6B' }}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="checkout-btn-wrapper">
                    <div className="toybox-total">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <button className="checkout-btn" onClick={() => navigate("/Checkout")}>Check Out Now</button>
                </div>
            </div>
        </section>
    );
}

export default ToyBox;
