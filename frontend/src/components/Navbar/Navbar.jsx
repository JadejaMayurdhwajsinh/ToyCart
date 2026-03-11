import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import cartIcon from "../../assets/cart-icon.svg";
import searchIcon from "../../assets/search-icon.svg";
import { useCart } from "../../hooks/useCart";
import { useEffect, useRef, useState } from "react";
import APIService from "../../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Navbar() {
    const { getCartCount, syncCart } = useCart();
    const navigate = useNavigate();
    const cartCount = getCartCount();

    const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;
    const isLoggedIn = !!token;

    const [userName,     setUserName]     = useState("");
    const [userAvatar,   setUserAvatar]   = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Search
    const [searchOpen,    setSearchOpen]    = useState(false);
    const [searchQuery,   setSearchQuery]   = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching,     setSearching]     = useState(false);
    const searchRef   = useRef(null);
    const inputRef    = useRef(null);
    const debounceRef = useRef(null);

    // Fetch profile
    useEffect(() => {
        if (!isLoggedIn) { setUserName(""); setUserAvatar(null); return; }
        const fetchProfile = () => {
            APIService.getProfile(token)
                .then((data) => {
                    setUserName(data?.user?.name || "User");
                    const av = data?.user?.avatar;
                    setUserAvatar(av ? (av.startsWith("http") ? av : `${API_BASE}${av}`) : null);
                })
                .catch(() => setUserName("User"));
        };
        fetchProfile();
        // Re-sync cart count whenever user logs in
        syncCart();
        window.addEventListener("profileUpdated", fetchProfile);
        return () => window.removeEventListener("profileUpdated", fetchProfile);
    }, [isLoggedIn, token]);

    // Close search on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
                setSearchResults([]);
                setSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Focus input when search opens
    useEffect(() => {
        if (searchOpen) inputRef.current?.focus();
    }, [searchOpen]);

    const handleSearchInput = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        clearTimeout(debounceRef.current);
        if (!q.trim()) { setSearchResults([]); return; }
        debounceRef.current = setTimeout(async () => {
            try {
                setSearching(true);
                const data = await APIService.getProducts({ search: q, limit: 6 });
                setSearchResults(Array.isArray(data) ? data : data.products || []);
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 350);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/Alltoys?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
        setSearchResults([]);
        setSearchQuery("");
    };

    const handleResultClick = (id) => {
        navigate(`/Pdp/${id}`);
        setSearchOpen(false);
        setSearchResults([]);
        setSearchQuery("");
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `${API_BASE}${path}`;
    };

    const handleLogout = () => {
        localStorage.removeItem("customerToken");
        setUserName("");
        setUserAvatar(null);
        setDropdownOpen(false);
        // Clear cart count immediately on logout
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/");
        window.location.reload();
    };

    return (
        <header className="navbar-wrapper">
            {/* Scrolling top bar */}
            <div className="top-bar">
                <div className="top-bar-content">
                    <span>♻️ Sustainable way to play</span>
                    <span>📦 Sell toys back to earn credit</span>
                    <span>🎁 20% off first box — NEWPLAYER20</span>
                    <span>🌍 The most sustainable toy store</span>
                    <span>♻️ Sustainable way to play</span>
                    <span>📦 Sell toys back to earn credit</span>
                    <span>🎁 20% off first box — NEWPLAYER20</span>
                    <span>🌍 The most sustainable toy store</span>
                </div>
            </div>

            <nav className="navbar">
                {/* Logo */}
                <div className="nav-left">
                    <Link to="/" className="logo">
                        <img src="../../public/images/toycart-logo.png" alt="ToyCart" className="toycart-logo" />
                    </Link>
                </div>

                {/* Nav links */}
                <ul className="nav-center">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/Alltoys">Product</Link></li>
                    <li><Link to="/Order">Order</Link></li>
                    <li><Link to="/About">About</Link></li>
                </ul>

                {/* Right side actions */}
                <div className="nav-right">

                    {/* ── Search ── */}
                    <div className={`nav-search ${searchOpen ? "nav-search--open" : ""}`} ref={searchRef}>
                        <button
                            className="icon-btn search-btn"
                            onClick={() => setSearchOpen((p) => !p)}
                            title="Search"
                        >
                            <img src={searchIcon} alt="Search" />
                        </button>

                        <form
                            className={`nav-search-form ${searchOpen ? "nav-search-form--open" : ""}`}
                            onSubmit={handleSearchSubmit}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                className="nav-search-input"
                                placeholder="Search toys..."
                                value={searchQuery}
                                onChange={handleSearchInput}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="nav-search-clear"
                                    onClick={() => { setSearchQuery(""); setSearchResults([]); inputRef.current?.focus(); }}
                                >✕</button>
                            )}
                        </form>

                        {/* Dropdown results */}
                        {searchOpen && searchQuery && (
                            <div className="nav-search-dropdown">
                                {searching && (
                                    <div className="nav-search-status">Searching...</div>
                                )}
                                {!searching && searchResults.length === 0 && (
                                    <div className="nav-search-status">No results for "{searchQuery}"</div>
                                )}
                                {!searching && searchResults.map((p) => (
                                    <div
                                        key={p.id}
                                        className="nav-search-result"
                                        onClick={() => handleResultClick(p.id)}
                                    >
                                        {p.image_url ? (
                                            <img src={getImageUrl(p.image_url)} alt={p.name} className="nav-search-result-img" />
                                        ) : (
                                            <div className="nav-search-result-placeholder">🧸</div>
                                        )}
                                        <div className="nav-search-result-info">
                                            <p className="nav-search-result-name">{p.name}</p>
                                            <p className="nav-search-result-price">₹{Number(p.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {!searching && searchResults.length > 0 && (
                                    <button className="nav-search-see-all" onClick={handleSearchSubmit}>
                                        See all results for "{searchQuery}"
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart */}
                    <button className="icon-btn cart-btn" onClick={() => navigate("/Order")} title="Cart">
                        <img src={cartIcon} alt="Cart" />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>

                    {isLoggedIn ? (
                        <div className="nav-user" onClick={() => setDropdownOpen((p) => !p)}>
                            <div className="nav-avatar" title={userName}>
                                {userAvatar ? (
                                    <img src={userAvatar} alt={userName} className="nav-avatar-img" />
                                ) : (
                                    userName.charAt(0).toUpperCase() || "U"
                                )}
                            </div>
                            <span className="nav-username">{userName.split(" ")[0]}</span>
                            <span className="nav-chevron">{dropdownOpen ? "▲" : "▼"}</span>

                            {dropdownOpen && (
                                <div className="nav-dropdown" onClick={(e) => e.stopPropagation()}>
                                    <div className="nav-dropdown-header">
                                        <div className="nav-avatar large">
                                            {userAvatar ? (
                                                <img src={userAvatar} alt={userName} className="nav-avatar-img" />
                                            ) : (
                                                userName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="nav-dropdown-name">{userName}</p>
                                        </div>
                                    </div>
                                    <hr className="nav-dropdown-divider" />
                                    <button className="nav-dropdown-item" onClick={() => { navigate("/profile/edit"); setDropdownOpen(false); }}>✏️ Edit Profile</button>
                                    <hr className="nav-dropdown-divider" />
                                    <button className="nav-dropdown-item" onClick={() => { navigate("/my-orders"); setDropdownOpen(false); }}>📦 My Orders</button>
                                    <hr className="nav-dropdown-divider" />
                                    <button className="nav-dropdown-item" onClick={() => { navigate("/wishlist"); setDropdownOpen(false); }}>♥ My Wishlist</button>
                                    <hr className="nav-dropdown-divider" />
                                    <button className="nav-dropdown-item logout" onClick={handleLogout}>🚪 Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="login-btn" onClick={() => navigate("/login")}>
                            <span className="login-btn-icon">👤</span>
                            Login
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
