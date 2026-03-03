import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import searchIcon from "../../assets/search-icon.svg";
import cartIcon from "../../assets/cart-icon.svg";
import { useCart } from "../../hooks/useCart";

function Navbar() {
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const cartCount = getCartCount();
    const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("customerToken");

    const handleCartClick = () => {
        navigate("/Checkout");
    };

    const handleLogout = () => {
        localStorage.removeItem("customerToken");
        navigate("/");
    };

    return (
        <header className="navbar-wrapper">
            <div className="top-bar">
                <div className="top-bar-content">
                    <span>♻️ Sustainable way to play</span>
                    <span>📦 Sell toys back to earn credit</span>
                    <span>🎁 20% off first box — NEWPLAYER20</span>
                    <span>♻️ Sustainable way to play</span>
                    <span>📦 Sell toys back to earn credit</span>
                    <span>🎁 20% off first box — NEWPLAYER20</span>
                </div>
            </div>

            <nav className="navbar">
                <div className="nav-left">
                    <Link to="/" className="logo">
                        <img src="../../public/images/toycart-logo.png" alt="toycart logo" className="toycart-logo"/>
                    </Link>
                </div>
                <ul className="nav-center">
                    <li><Link to="/">Home</Link></li>
                    {/* <li><Link to="/Checkout">Checkout</Link></li> */}
                    <li><Link to="/Alltoys">Product</Link></li>
                    <li><Link to="/Order">Order</Link></li>
                    <li><Link to="/About">About</Link></li>
                    {/* <li><Link to="/Collection">Collection</Link></li> */}
                    {/* <li><Link to="/Product">Product</Link></li> */}
                </ul>
                <div className="nav-right">
                    {/* <button className="icon-btn">
                        <img src={searchIcon} alt="Search" />
                    </button> */}

                    <button className="icon-btn cart-btn" onClick={handleCartClick}>
                        <img src={cartIcon} alt="Cart" />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                    {isLoggedIn ? (
                        <button className="login-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    ) : (
                        <button className="login-btn" onClick={() => navigate("/login")}>
                            Login
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
