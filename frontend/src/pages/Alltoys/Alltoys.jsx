import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Actioncard from "../../components/Actioncard/Actioncard.jsx";
import arrow from "../../assets/arrow.svg";
import "./Alltoys.css";
import fanimg1 from "../../../public/images/fan-img1.jpg";
import fanimg2 from "../../../public/images/fan-img2.png";
import fanimg3 from "../../../public/images/fan-img3.png";
import fanimg4 from "../../../public/images/fan-img4.png";
import fanimg5 from "../../../public/images/fan-img5.png";
import fanimg6 from "../../../public/images/fan-img6.png";
import fanimg7 from "../../../public/images/fan-img7.png";
import fanimg8 from "../../../public/images/fan-img8.png";
import Reviewcard from "../../components/Reviewcard/Reviewcard.jsx";
import Productcard from "../../components/Productcard/Productcard.jsx";
import APIService from "../../services/api";

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

function Alltoys() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "", category: "", minPrice: "", maxPrice: "", rating: "", availability: "",
  });
  const [sort, setSort] = useState("");
  const [applied, setApplied] = useState({});

  const filterRef = useRef(null);
  const sortRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    if (q) setFilters((prev) => ({ ...prev, search: q }));
  }, [location.search]);

  useEffect(() => {
    APIService.getCategories?.()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, []);

  useEffect(() => { fetchProducts(); }, [applied, sort]);

  const fetchProducts = async () => {
    try {
      setLoading(true); setError("");
      const params = {};
      if (applied.search) params.search = applied.search;
      if (applied.category) params.category = applied.category;
      if (applied.minPrice) params.minPrice = applied.minPrice;
      if (applied.maxPrice) params.maxPrice = applied.maxPrice;
      if (applied.rating) params.rating = applied.rating;
      if (applied.availability) params.availability = applied.availability;
      if (sort) params.sort = sort;
      const data = await APIService.getProducts(params);
      const list = Array.isArray(data) ? data : data.products || [];
      setProducts(list);
      setTotalCount(list.length);
    } catch { setError("Unable to load toys right now."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleApplyFilters = () => { setApplied({ ...filters }); setFilterOpen(false); };

  const handleClearFilters = () => {
    const empty = { search: "", category: "", minPrice: "", maxPrice: "", rating: "", availability: "" };
    setFilters(empty); setApplied(empty); setSort("");
    navigate("/Alltoys", { replace: true });
  };

  const activeFilterCount = Object.values(applied).filter(Boolean).length;
  const currentSortLabel = sort ? SORT_OPTIONS.find((o) => o.value === sort)?.label : "Sort by";

  return (<>
    <section className="hero">
      <div className="hero-content">
        <p className="hero-content__p1">Browse toys <span><img src={arrow} alt="arrow" className="arrow-icon" /></span> All toys</p>
        <h1 className="hero-content__h1">All toys</h1>
        <p className="hero-content__p2">Nam leo porta sit id aliquam in lobortis vitae consequat. Massa purus orci volutpat duis parturient.</p>
      </div>
    </section>

    <section className="product-section">

      {/* ── Toolbar ── */}
      <div className="at-toolbar">

        {/* Filter */}
        <div className="at-toolbar-left" ref={filterRef}>
          <button
            className={`at-filter-btn ${activeFilterCount > 0 ? "at-filter-btn--active" : ""}`}
            onClick={() => { setFilterOpen((p) => !p); setSortOpen(false); }}
          >
            <span className="at-filter-icon">⚙</span>
            Filter
            {activeFilterCount > 0 && <span className="at-filter-badge">{activeFilterCount}</span>}
          </button>

          {filterOpen && (
            <div className="at-filter-panel">

              {/* ── Header ── */}
              <div className="at-filter-header">
                <h3>Filters</h3>
                <button className="at-filter-close" onClick={() => setFilterOpen(false)}>✕</button>
              </div>

              {/* ── Scrollable body ── */}
              <div className="at-filter-body">

                <div className="at-filter-group">
                  <label>Search</label>
                  <input
                    type="text"
                    placeholder="Search toys..."
                    value={filters.search}
                    onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  />
                </div>

                <hr className="at-filter-divider" />

                {categories.length > 0 && (
                  <div className="at-filter-group">
                    <label>Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
                    >
                      <option value="">All categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <hr className="at-filter-divider" />

                <div className="at-filter-group">
                  <label>Price Range (₹)</label>
                  <div className="at-price-row">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
                    />
                    <span>–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                    />
                  </div>
                </div>

                <hr className="at-filter-divider" />

                <div className="at-filter-group">
                  <label>Min Rating</label>
                  <div className="at-rating-options">
                    {[4, 3, 2, 1].map((r) => (
                      <button
                        key={r}
                        className={`at-rating-opt ${filters.rating == r ? "at-rating-opt--active" : ""}`}
                        onClick={() => setFilters((p) => ({ ...p, rating: p.rating == r ? "" : r }))}
                      >
                        {"★".repeat(r)}<br />& up
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="at-filter-divider" />

                <div className="at-filter-group">
                  <label>Availability</label>
                  <div className="at-avail-options">
                    {[
                      { value: "in_stock", label: "✓ In Stock" },
                      { value: "out_of_stock", label: "✕ Out of Stock" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        className={`at-avail-opt ${filters.availability === opt.value ? "at-avail-opt--active" : ""}`}
                        onClick={() => setFilters((p) => ({ ...p, availability: p.availability === opt.value ? "" : opt.value }))}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* ── Footer actions — fixed at bottom ── */}
              <div className="at-filter-actions">
                <button className="at-clear-btn" onClick={handleClearFilters}>Clear All</button>
                <button className="at-apply-btn" onClick={handleApplyFilters}>Apply Filters</button>
              </div>x

            </div>
          )}
        </div>

        {/* Results count */}
        <p className="at-results-count">
          {activeFilterCount > 0 && !loading && (
            <>
              {totalCount} toy{totalCount !== 1 ? "s" : ""} found
              <button className="at-clear-link" onClick={handleClearFilters}>Clear filters</button>
            </>
          )}
        </p>

        {/* Sort */}
        <div className="at-toolbar-right" ref={sortRef}>
          <button
            className={`at-sort-btn ${sort ? "at-sort-btn--active" : ""}`}
            onClick={() => { setSortOpen((p) => !p); setFilterOpen(false); }}
          >
            {currentSortLabel} <span className="at-sort-icon">↕</span>
          </button>

          {sortOpen && (
            <div className="at-sort-panel">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`at-sort-option ${sort === opt.value ? "at-sort-option--active" : ""}`}
                  onClick={() => { setSort(opt.value); setSortOpen(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Product grid ── */}
      <div className="product-section__content">
        {loading && <p className="at-loading">Loading toys...</p>}
        {error && !loading && <p style={{ color: "#c00" }}>{error}</p>}
        {!loading && !error && products.length === 0 && (
          <div className="at-empty">
            <p>🧸 No toys found. <button className="at-clear-link" onClick={handleClearFilters}>Clear filters</button></p>
          </div>
        )}
        {!loading && !error && products.map((product) => (
          <Productcard
            key={product.id}
            id={product.id}
            ProductImage={product.image_url}
            ProductName={product.name}
            Price={product.price}
            rating={product.rating}
            reviewCount={product.number_of_reviews}
          />
        ))}
      </div>
    </section>

    <section className="fan-section">
      <div className="fan-content">
        <div className="fan-content__top">
          <h2 className="fan-content__top-h2">Our smallest fans</h2>
        </div>
        <div className="fan-content__center">
          <img src={fanimg1} alt="fan image1" className="fan-img1" />
          <Reviewcard msgTitle="Thank you whirli!!" msgText="It's been wonderful for my three kids to play with so many different toys in such an environmentally friendly and cost effective way." fanName="– Jessica Lucey, Mum of three" />
          <img src={fanimg2} alt="fan image2" className="fan-img2" />
          <Reviewcard msgTitle="What a great idea!" msgText="Children get bored of toys so quickly and we were able to send back and get different toys whenever we wanted easily. Their customer service is also 10/10..." fanName="– Jennifer Mello, Mum of two" />
          <img src={fanimg3} alt="fan image3" className="fan-img3" />
        </div>
        <div className="fan-content__bottom">
          <Reviewcard msgTitle="Thank you whirli!!" msgText="It's been wonderful for my three kids to play with so many different toys in such an environmentally friendly and cost effective way." fanName="– Jessica Lucey, Mum of three" />
          <img src={fanimg4} alt="fan image4" className="fan-img4" />
          <img src={fanimg5} alt="fan image5" className="fan-img5" />
          <div className="fan-content__bottom-img">
            <img src={fanimg6} alt="fan image6" className="fan-img6" />
            <img src={fanimg7} alt="fan image7" className="fan-img7" />
          </div>
          <Reviewcard msgTitle="Thank you whirli!!" msgText="It's been wonderful for my three kids to play with so many different toys in such an environmentally friendly and cost effective way." fanName="– Jessica Lucey, Mum of three" />
          <img src={fanimg8} alt="fan image8" className="fan-img8" />
        </div>
      </div>
    </section>

    <section className="toy-actions">
      <Actioncard title="Buy this toy new and pre-loved" text="Nam leo porttitor sit aliquam in lobortis vitae consequat." button="Buy this toy" variant="yellow" />
      <Actioncard title="Sell a toy like this back to Whirli" text="Placerat sollicitudin faucibus egestas viverra, cursus nascetur fermentum nam." button="Sell this toy back" variant="white" />
      <Actioncard title="Gift this toy with a Whirli subscription" text="Porta sit id aliquam in lobortis vitae consequat." button="Gift this toy" variant="pink" />
    </section>
  </>);
}

export default Alltoys;
