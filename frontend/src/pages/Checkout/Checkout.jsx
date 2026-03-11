import "./Checkout.css";
import { useEffect, useState, useRef } from "react";
import CheckoutForm from "../../components/CheckoutForm/CheckoutForm.jsx";
import Actioncard from "../../components/Actioncard/Actioncard.jsx";
import Productcard from "../../components/Productcard/Productcard.jsx";
import APIService from "../../services/api";
import navprev from "../../assets/nav-prev.svg";
import navnext from "../../assets/nav-next.svg";

const VISIBLE_COUNT = 4;

function Checkout() {
    const [products, setProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [direction, setDirection] = useState(null); // "next" | "prev"
    const sliderRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await APIService.getProducts(); // adjust if your method name differs
                setProducts(data);
            } catch (err) {
                console.error("Failed to load products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const maxIndex = Math.max(0, products.length - VISIBLE_COUNT);

    const handlePrev = () => {
        if (animating || currentIndex === 0) return;
        setDirection("prev");
        setAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => Math.max(0, prev - VISIBLE_COUNT));
            setAnimating(false);
            setDirection(null);
        }, 350);
    };

    const handleNext = () => {
        if (animating || currentIndex >= maxIndex) return;
        setDirection("next");
        setAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => Math.min(maxIndex, prev + VISIBLE_COUNT));
            setAnimating(false);
            setDirection(null);
        }, 350);
    };

    const visibleProducts = products.slice(currentIndex, currentIndex + VISIBLE_COUNT);

    const totalDots = Math.ceil(products.length / VISIBLE_COUNT);
    const activeDot = Math.floor(currentIndex / VISIBLE_COUNT);

    return (
        <>
            <CheckoutForm />

            <section className="moreToys-section">
                <div className="moreToys-content">
                    <div className="section-heading">
                        <h4>More toys for you</h4>
                        <div className="heading-actions">
                            <a href="/Alltoys" className="see-all-btn">See all toys</a>
                            <button
                                className={`nav-btn nav-prev ${currentIndex === 0 ? "disabled" : ""}`}
                                onClick={handlePrev}
                                disabled={currentIndex === 0 || animating}
                                aria-label="Previous products"
                                data-tooltip="Previous"
                            >
                                <img src={navprev} alt="nav prev" />
                            </button>
                            <button
                                className={`nav-btn nav-next ${currentIndex >= maxIndex ? "disabled" : ""}`}
                                onClick={handleNext}
                                disabled={currentIndex >= maxIndex || animating}
                                aria-label="Next products"
                                data-tooltip="Next"
                            >
                                <img src={navnext} alt="nav next" />
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="slider-loading">
                            {[...Array(VISIBLE_COUNT)].map((_, i) => (
                                <div key={i} className="skeleton-card" />
                            ))}
                        </div>
                    )}

                    {!loading && products.length > 0 && (
                        <>
                            <div
                                ref={sliderRef}
                                className={`slider-track ${animating ? `slide-${direction}` : ""}`}
                            >
                                {visibleProducts.map((product) => (
                                    <Productcard
                                        key={product.id}
                                        id={product.id}
                                        ProductImage={
                                            product.image_url
                                                ? product.image_url.startsWith("/uploads")
                                                    ? `http://localhost:5000${product.image_url}`
                                                    : product.image_url
                                                : product.ProductImage
                                        }
                                        ProductName={product.name || product.ProductName}
                                        Price={product.price || product.Price}
                                    />
                                ))}
                            </div>

                            {totalDots > 1 && (
                                <div className="slider-dots">
                                    {[...Array(totalDots)].map((_, i) => (
                                        <button
                                            key={i}
                                            className={`dot ${i === activeDot ? "active" : ""}`}
                                            onClick={() => {
                                                if (animating) return;
                                                setDirection(i > activeDot ? "next" : "prev");
                                                setAnimating(true);
                                                setTimeout(() => {
                                                    setCurrentIndex(i * VISIBLE_COUNT);
                                                    setAnimating(false);
                                                    setDirection(null);
                                                }, 350);
                                            }}
                                            aria-label={`Go to page ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {!loading && products.length === 0 && (
                        <p className="no-products">No products available right now.</p>
                    )}
                </div>
            </section>

            <section className="checkout-actions">
                <Actioncard
                    title="Buy toys new from our marketplace"
                    text="Nam leo porttitor sit aliquam in lobortis vitae consequat. Massa purus orci volutpat duis parturient. Ut nunc id bibendum."
                    button="Marketplace"
                    variant="yellow"
                />
                <Actioncard
                    title="Sell toys back to our Whirli collection"
                    text="Placerat sollicitudin faucibus egestas viverra, cursus nascetur fermentum nam. Massa egestas arcu blandit a. Suspendisse lectus orci."
                    button="Sell toys"
                    variant="white"
                />
                <Actioncard
                    title="Gift toys or a Whirli subscription"
                    text="Porta sit id aliquam in lobortis vitae consequat. Massa purus orci volutpat duis parturient. Ut nunc id bibendum."
                    button="Gifting"
                    variant="pink"
                />
            </section>
        </>
    );
}

export default Checkout;
