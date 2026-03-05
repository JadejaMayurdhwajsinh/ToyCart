import "./CheckoutForm.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnicon from "../../assets/return-icon.svg";
import APIService from "../../services/api";

function CheckoutForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        company: "",
        address: "",
        suburb: "",
        country: "",
        state: "",
        postcode: "",
    });
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;

    const fetchCart = async () => {
        if (!token) return;
        try {
            setLoading(true);
            setError("");
            const data = await APIService.getCart(token);
            setCart(data);
        } catch (err) {
            setError("Unable to load your cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totalAmount = useMemo(
        () => cart?.summary?.total ?? 0,
        [cart]
    );

    const handleReturnToCart = () => {
        navigate("/Order");
    };

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError("Please login as a customer before placing an order.");
            return;
        }
        if (!cart || !cart.items || cart.items.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const payload = {
                delivery_address: `${form.firstName} ${form.lastName}, ${form.address}, ${form.suburb}, ${form.company}`.trim(),
                city: form.suburb,
                state: form.state,
                zipcode: form.postcode,
                phone: form.phone,
                payment_method: "cash_on_delivery",
                special_notes: "",
            };

            const data = await APIService.placeOrder(payload, token);
            setSuccess("Order placed successfully!");
            await APIService.clearCart(token);
            setCart({ items: [], summary: { total: 0 } });
            setTimeout(() => navigate("/"), 1200);
        } catch (err) {
            setError(err.message || "Could not place order.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="checkout-section">
            <div className="checkout-wrapper">
                <div className="checkout-form">
                    <h2>Checkout</h2>
                    {loading && <p>Loading your cart...</p>}
                    {error && !loading && <p style={{ color: "#c00" }}>{error}</p>}
                    {success && <p style={{ color: "#0a0" }}>{success}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="contact-info">
                            <p>Contact Information</p>
                            <div className="form-row">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone number"
                                    value={form.phone}
                                    onChange={handleChange("phone")}
                                    required
                                />
                            </div>
                        </div>
                        <div className="shipping-address">
                            <p>Shipping Address</p>
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="First name"
                                    value={form.firstName}
                                    onChange={handleChange("firstName")}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Last name"
                                    value={form.lastName}
                                    onChange={handleChange("lastName")}
                                    required
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Company(optional)"
                                value={form.company}
                                onChange={handleChange("company")}
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                value={form.address}
                                onChange={handleChange("address")}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Suburb"
                                value={form.suburb}
                                onChange={handleChange("suburb")}
                            />
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="Country / region"
                                    value={form.country}
                                    onChange={handleChange("country")}
                                />
                                <input
                                    type="text"
                                    placeholder="State / territory"
                                    value={form.state}
                                    onChange={handleChange("state")}
                                />
                                <input
                                    type="text"
                                    placeholder="Postcode"
                                    value={form.postcode}
                                    onChange={handleChange("postcode")}
                                />
                            </div>
                        </div>
                        <div className="buttons">
                            <button type="button" onClick={handleReturnToCart} className="btn-return">
                                <img src={returnicon} alt="return icon" className="return-icon" />
                                <span>Return to cart</span>
                            </button>
                            <button type="submit" className="btn-continue" disabled={submitting}>
                                {submitting ? "Placing order..." : "Place order"}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="order-summary">
                    <div className="order-items">
                        {cart?.items?.map((item) => (
                            <div key={item.id} className="order-item">
                                {item.Product?.image_url && (
                                    <img
                                        src={item.Product.image_url.startsWith("/uploads")
                                            ? `http://localhost:5000${item.Product.image_url}`
                                            : item.Product.image_url}
                                        alt={item.Product.name}
                                    />
                                )}
                                <div className="item-details">
                                    <p className="item-name">{item.Product?.name}</p>
                                    <p className="item-price">
                                        ${item.Product?.price} × {item.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {(!cart || !cart.items || cart.items.length === 0) && !loading && (
                            <p>No items in your order yet.</p>
                        )}
                    </div>
                    <div className="order-total">
                        <div className="total-row">
                            <span>Total</span>
                            <span className="total-amount">${Number(totalAmount).toFixed(2)}</span>
                        </div>
                        <p className="total-tax">Taxes included where applicable.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CheckoutForm;
