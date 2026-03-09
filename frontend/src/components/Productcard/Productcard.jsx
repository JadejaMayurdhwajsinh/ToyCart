import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Productcard.css";
import coin from "../../assets/coin-icon.svg";
import APIService from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StarRating({ rating = 0, count = 0 }) {
    const filled = Math.round(rating);
    return (
        <div className="pc-stars">
            {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`pc-star ${n <= filled ? "pc-star--filled" : ""}`}>★</span>
            ))}
            {count > 0 && <span className="pc-review-count">({count})</span>}
        </div>
    );
}

function Productcard({ id, ProductImage, ProductName, Price, rating = 0, reviewCount = 0, isNew = false }) {
    const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;

    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Check if product is already in wishlist on mount
    useEffect(() => {
        if (!token || !id) return;
        APIService.checkWishlist(id, token)
            .then((data) => setWishlisted(data?.inWishlist || false))
            .catch(() => { });
    }, [id, token]);

    const handleAddToToybox = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = `/Pdp/${id}`;
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) { window.location.href = "/login"; return; }
        if (wishlistLoading) return;
        try {
            setWishlistLoading(true);
            if (wishlisted) {
                await APIService.removeFromWishlist(id, token);
                setWishlisted(false);
            } else {
                await APIService.addToWishlist(id, token);
                setWishlisted(true);
            }
        } catch {
            // silent fail
        } finally {
            setWishlistLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${API_URL}${path}`;
    };

    return (
        <Link to={`/Pdp/${id}`} className="product-card-link">
            <div className="product-card">
                <div className="product-card__top">
                    <div className="product-card__top-first">
                        <div> {/* empty div to push wishlist right when no badge */}
                            {isNew && <p className="badge">NEW IN</p>}
                        </div>
                        <button
                            className={`wishlist-btn ${wishlisted ? "wishlist-btn--active" : ""}`}
                            onClick={handleWishlist}
                            disabled={wishlistLoading}
                            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            {wishlisted ? "♥" : "♡"}
                        </button>
                    </div>
                    <div className="product-card__top-second">
                        <img
                            src={getImageUrl(ProductImage)}
                            alt={ProductName}
                            className="product-img"
                        />
                        <button className="addToToybox" onClick={handleAddToToybox}>Add to toybox</button>
                    </div>
                </div>
                <div className="product-card__bottom">
                    <p className="product-name">{ProductName}</p>
                    <StarRating rating={rating} count={reviewCount} />
                    <p className="product-price">
                        <span><img src={coin} alt="coin icon" className="coin-icon" /></span>
                        ₹{Number(Price).toLocaleString()}
                    </p>
                </div>
            </div>
        </Link>
    );
}

export function SkeletonCard() {
    return (
        <div className="product-card skeleton-card">
            <div className="product-card__top">
                <div className="product-card__top-first">
                    <div className="skeleton skeleton-badge" />
                    <div className="skeleton skeleton-heart" />
                </div>
                <div className="product-card__top-second">
                    <div className="skeleton skeleton-img" />
                    <div className="skeleton skeleton-btn" />
                </div>
            </div>
            <div className="product-card__bottom">
                <div className="skeleton skeleton-name" />
                <div className="skeleton skeleton-stars" />
                <div className="skeleton skeleton-price" />
            </div>
        </div>
    );
}

export default Productcard;
