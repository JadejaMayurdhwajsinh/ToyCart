import { Link } from "react-router-dom";
import "./Productcard.css";
import wishlisticon from "../../assets/wishlist-icon.svg";
import coin from "../../assets/coin-icon.svg";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Productcard({ id, ProductImage, ProductName, Price }) {

    const handleAddToToybox = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // In a full flow, this should call an API to add to cart.
        // For now, navigation to product detail keeps UX consistent.
        window.location.href = `/Pdp/${id}`;
    };

    const getImageUrl = (path) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${API_URL}${path}`;
    };

    console.log("API_URL:", API_URL);
    console.log("ProductImage:", ProductImage);
    console.log("Full src:", `${API_URL}/uploads/${ProductImage}`);

    return (
        <Link to={`/Pdp/${id}`} className="product-card-link">
            <div className="product-card">
                <div className="product-card__top">
                    <div className="product-card__top-first">
                        <p className="badge">NEW IN</p>
                        <img src={wishlisticon} alt="wishlist icon" className="wishlist-icon" />
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
                    <img src="/images/review-star.png" alt="review star" className="reviewstar" />
                    <p className="product-price">
                        <span><img src={coin} alt="coin icon" className="coin-icon" /></span>
                        {Price}
                    </p>
                </div>
            </div>
        </Link>
    );
}

export default Productcard;
