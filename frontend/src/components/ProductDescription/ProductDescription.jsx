import "./ProductDescription.css";
import { useState } from "react";
import { useCart } from "../../hooks/useCart";
import APIService from "../../services/api";
import navprev from "../../assets/nav-prev.svg";
import navnext from "../../assets/nav-next.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const resolveImage = (src) => {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("blob:")) return src;
  if (src.startsWith("/uploads")) return `${API_BASE}${src}`;
  return src;
};

function ProductDescription({ product, productId }) {
  const {
    title,
    price,
    mainImage,
    images,
    ratingImage,
    description,
    details,
    coinIcon,
    lineIcon,
  } = product;

  // Full gallery: main image first, then additional_images
  const allImages = [mainImage, ...(Array.isArray(images) ? images : [])].filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);

  const goPrev = () => setActiveIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;
    if (!token) { window.alert("Please login as a customer before adding items to cart."); return; }
    const pid = productId || 1;
    try {
      await APIService.addToCart({ productId: pid, quantity: 1 }, token);
      addToCart({ id: pid, ProductName: title, Price: price, ProductImage: mainImage });
    } catch (err) {
      console.error("Error adding to cart:", err);
      window.alert(err.message || "Unable to add to cart. Please try again.");
    }
  };

  return (
    <div className="product-description">

      {/* LEFT — IMAGE SWIPER */}
      <div className="product-description__images">

        <div className="pdp-slider">
          {/* Prev arrow */}
          {allImages.length > 1 && (
            <button className="pdp-slider__arrow pdp-slider__arrow--prev" onClick={goPrev}><img src={navprev} alt="navprev" className="nav-prev"/></button>
          )}

          {/* Main image */}
          <img
            src={resolveImage(allImages[activeIndex])}
            alt={`${title} view ${activeIndex + 1}`}
            className="pdp-slider__main-img"
            onError={(e) => { e.target.style.display = "none"; }}
          />

          {/* Next arrow */}
          {allImages.length > 1 && (
            <button className="pdp-slider__arrow pdp-slider__arrow--next" onClick={goNext}><img src={navnext} alt="navnext" className="nav-next"/></button>
          )}

          {/* Dots */}
          {allImages.length > 1 && (
            <div className="pdp-slider__dots">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  className={`pdp-slider__dot ${i === activeIndex ? "pdp-slider__dot--active" : ""}`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="product-description__images-bottom">
            {allImages.map((img, index) => (
              <img
                key={index}
                src={resolveImage(img)}
                alt={`${title} thumb ${index + 1}`}
                className={`product-thumb ${index === activeIndex ? "thumb-active" : ""}`}
                onClick={() => setActiveIndex(index)}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — CONTENT (unchanged) */}
      <div className="product-description__content">
        <div>
          <h2 className="product-description__content-title">{title}</h2>
          <p className="product-description__content-price">
            {coinIcon && <span><img src={coinIcon} alt="coin icon" /></span>}
            {price}
          </p>
          {ratingImage && <img src={ratingImage} alt="rating" className="review-4star" />}
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
