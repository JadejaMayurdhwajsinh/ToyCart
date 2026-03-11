import "./ProductDescription.css";
import { useState } from "react";
import { useCart } from "../../hooks/useCart";
import APIService from "../../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const resolveImage = (src) => {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("blob:")) return src;
  if (src.startsWith("/uploads")) return `${API_BASE}${src}`;
  return src;
};

function ProductDescription({ product, productId }) {
  const { title, price, description, details, coinIcon, lineIcon, mainImage, images } = product;

  const allImages = [mainImage, ...(Array.isArray(images) ? images : [])].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  const goPrev = () => setActiveIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;
    if (!token) {
      window.alert("Please login as a customer before adding items to cart.");
      return;
    }
    const pid = productId || 1;
    try {
      await APIService.addToCart({ productId: pid, quantity: 1 }, token);
      addToCart({ id: pid, ProductName: title, Price: price, ProductImage: mainImage });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      window.alert(err.message || "Unable to add to cart. Please try again.");
    }
  };

  return (
    <div className="product-description">

      {/* LEFT — IMAGE GALLERY */}
      <div className="product-description__images">

        {/* Main image box */}
        <div className="pdp-main-box">
          {allImages.length > 1 && (
            <button className="pdp-arrow pdp-arrow--prev" onClick={goPrev} aria-label="Previous">
              ‹
            </button>
          )}

          <img
            key={activeIndex}
            src={resolveImage(allImages[activeIndex])}
            alt={`${title} view ${activeIndex + 1}`}
            className="pdp-main-img"
            onError={(e) => { e.target.style.opacity = 0; }}
          />

          {allImages.length > 1 && (
            <button className="pdp-arrow pdp-arrow--next" onClick={goNext} aria-label="Next">
              ›
            </button>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="pdp-thumbs">
            {allImages.map((img, i) => (
              <button
                key={i}
                className={`pdp-thumb-btn ${i === activeIndex ? "pdp-thumb-btn--active" : ""}`}
                onClick={() => setActiveIndex(i)}
              >
                <img
                  src={resolveImage(img)}
                  alt={`${title} thumb ${i + 1}`}
                  onError={(e) => { e.target.style.opacity = 0; }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — CONTENT */}
      <div className="product-description__content">
        <div>
          <h2 className="product-description__content-title">{title}</h2>
          <p className="product-description__content-price">
            {coinIcon && <span><img src={coinIcon} alt="coin icon" /></span>}
            ₹{price}
          </p>
          <div className="pdp-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={`pdp-star ${n <= Math.round(product.rating || 0) ? "pdp-star--filled" : ""}`}>★</span>
            ))}
            {product.rating > 0 && (
              <span className="pdp-star-count">{Number(product.rating).toFixed(1)} / 5</span>
            )}
          </div>
          <p className="product-description__content-text">{description}</p>
          {lineIcon && <img src={lineIcon} alt="line" className="line" />}
          <button className="addToCart" onClick={handleAddToCart}>Add to cart</button>
          {lineIcon && <img src={lineIcon} alt="line" className="line" />}
        </div>

        <div className="product-details">
          {details?.map((item, index) => (
            <div key={index}>
              <div className="product-details__item">
                <div className="product-details__icon">
                  <img src={item.icon} alt={item.title} />
                </div>
                <div className="product-details__text">
                  <p className="product-details__title">{item.title}</p>
                  <p className="product-details__desc">{item.value}</p>
                </div>
              </div>
              {lineIcon && <img src={lineIcon} alt="line" className="line" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDescription;
