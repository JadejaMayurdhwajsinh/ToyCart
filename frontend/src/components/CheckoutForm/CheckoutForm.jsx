import "./CheckoutForm.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnicon from "../../assets/return-icon.svg";
import APIService from "../../services/api";

// ── Validation rules ──────────────────────────────────────────────
const validators = {
    email: (v) => {
        if (!v.trim()) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
        return "";
    },
    phone: (v) => {
        if (!v.trim()) return "Phone number is required.";
        if (!/^\d+$/.test(v)) return "Phone number must contain digits only.";
        if (v.length < 10 || v.length > 15) return "Phone number must be 10–15 digits.";
        return "";
    },
    firstName: (v) => {
        if (!v.trim()) return "First name is required.";
        if (/\d/.test(v)) return "First name must not contain numbers.";
        return "";
    },
    lastName: (v) => {
        if (!v.trim()) return "Last name is required.";
        if (/\d/.test(v)) return "Last name must not contain numbers.";
        return "";
    },
    address: (v) => {
        if (!v.trim()) return "Address is required.";
        if (v.trim().length < 5) return "Please enter a complete address.";
        return "";
    },
    suburb: (v) => {
        if (!v.trim()) return "Suburb / city is required.";
        return "";
    },
    country: (v) => {
        if (!v.trim()) return "Country is required.";
        return "";
    },
    state: (v) => {
        if (!v.trim()) return "State is required.";
        return "";
    },
    postcode: (v) => {
        if (!v.trim()) return "Postcode is required.";
        if (!/^\d+$/.test(v)) return "Postcode must contain digits only.";
        if (v.length < 4 || v.length > 10) return "Enter a valid postcode.";
        return "";
    },
    company: () => "",   // optional — always passes
};

function validateAll(form) {
    const errs = {};
    Object.keys(validators).forEach((field) => {
        const msg = validators[field](form[field] ?? "");
        if (msg) errs[field] = msg;
    });
    return errs;
}

// ── Reusable Field component ──────────────────────────────────────
function Field({ type = "text", placeholder, value, onChange, onBlur, error, ...rest }) {
    return (
        <div className="field-wrapper">
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={error ? "input-error" : ""}
                {...rest}
            />
            {error && <span className="field-error">{error}</span>}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
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
    const [touched, setTouched] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

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

    const totalAmount = useMemo(() => cart?.summary?.total ?? 0, [cart]);

    const handleReturnToCart = () => navigate("/Order");

    const handleChange = (field) => (e) => {
        const val = e.target.value;
        setForm((prev) => ({ ...prev, [field]: val }));
        if (touched[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: validators[field](val) }));
        }
    };

    const handleBlur = (field) => () => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setFieldErrors((prev) => ({ ...prev, [field]: validators[field](form[field]) }));
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

        const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
        setTouched(allTouched);
        const errs = validateAll(form);
        setFieldErrors(errs);

        if (Object.keys(errs).length > 0) {
            const firstErrorEl = document.querySelector(".input-error");
            firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
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

            await APIService.placeOrder(payload, token);
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

    const fieldProps = (name, type = "text") => ({
        type,
        value: form[name],
        onChange: handleChange(name),
        onBlur: handleBlur(name),
        error: fieldErrors[name] || "",
    });

    return (
        <section className="checkout-section">
            <div className="checkout-wrapper">
                <div className="checkout-form">
                    <h2>Checkout</h2>
                    {loading && <p>Loading your cart...</p>}
                    {error && !loading && <p className="form-error-banner">{error}</p>}
                    {success && <p className="form-success-banner">{success}</p>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="contact-info">
                            <p>Contact Information</p>
                            <div className="form-row">
                                <Field placeholder="Email" {...fieldProps("email", "email")} />
                                <Field placeholder="Phone number" {...fieldProps("phone", "tel")} />
                            </div>
                        </div>

                        <div className="shipping-address">
                            <p>Shipping Address</p>
                            <div className="form-row">
                                <Field placeholder="First name" {...fieldProps("firstName")} />
                                <Field placeholder="Last name" {...fieldProps("lastName")} />
                            </div>
                            <Field placeholder="Company (optional)" {...fieldProps("company")} />
                            <Field placeholder="Address" {...fieldProps("address")} />
                            <Field placeholder="Suburb" {...fieldProps("suburb")} />
                            <div className="form-row">
                                <Field placeholder="Country / region" {...fieldProps("country")} />
                                <Field placeholder="State / territory" {...fieldProps("state")} />
                                <Field placeholder="Postcode" {...fieldProps("postcode")} />
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
                                        ₹{item.Product?.price} × {item.quantity}
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
                            <span className="total-amount">₹{Number(totalAmount).toFixed(2)}</span>
                        </div>
                        <p className="total-tax">Taxes included where applicable.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CheckoutForm;
