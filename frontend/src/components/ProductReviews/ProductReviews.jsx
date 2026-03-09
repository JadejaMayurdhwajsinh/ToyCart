import { useEffect, useState } from "react";
import "./ProductReviews.css";
import APIService from "../../services/api";

// ── Star renderer ──────────────────────────────────────────
function Stars({ rating, size = 18, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="pr-stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`pr-star ${n <= (interactive ? hovered || rating : rating) ? "pr-star--filled" : ""}`}
          style={interactive ? { cursor: "pointer" } : {}}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate && onRate(n)}
        >★</span>
      ))}
    </div>
  );
}

// ── Rating breakdown bar ───────────────────────────────────
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="pr-bar-row">
      <span className="pr-bar-label">{star}★</span>
      <div className="pr-bar-track">
        <div className="pr-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="pr-bar-count">{count}</span>
    </div>
  );
}

export default function ProductReviews({ productId, productRating, totalReviews }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;

  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [breakdown, setBreakdown] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  // Write review form
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formText, setFormText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // User's existing review
  const [myReview, setMyReview] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const loadReviews = async (s = sort) => {
    try {
      setLoading(true);
      const data = await APIService.getProductReviews(productId, { sort: s, limit: 20 });
      const rows = data.reviews || [];
      setReviews(rows);
      setPagination(data.pagination || {});

      // Build star breakdown
      const bd = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      rows.forEach(r => { if (bd[r.rating] !== undefined) bd[r.rating]++; });
      setBreakdown(bd);

      // Find my review
      if (token) {
        // Decode userId from token (JWT payload is base64)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const mine = rows.find(r => r.userId === payload.id);
          setMyReview(mine || null);
        } catch { setMyReview(null); }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, [productId]);

  const handleSortChange = (s) => {
    setSort(s);
    loadReviews(s);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formRating) { setFormError("Please select a star rating."); return; }
    try {
      setSubmitting(true);
      setFormError("");
      if (editMode && myReview) {
        await APIService.updateReview(myReview.id, { rating: formRating, title: formTitle, review_text: formText }, token);
        setFormSuccess("Review updated!");
      } else {
        await APIService.addReview({ productId, rating: formRating, title: formTitle, review_text: formText }, token);
        setFormSuccess("Review submitted! Thank you 🧸");
      }
      setShowForm(false);
      setEditMode(false);
      setFormRating(0); setFormTitle(""); setFormText("");
      await loadReviews();
    } catch (err) {
      setFormError(err.message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    if (!window.confirm("Delete your review?")) return;
    try {
      await APIService.deleteReview(myReview.id, token);
      setMyReview(null);
      await loadReviews();
    } catch (err) {
      alert(err.message || "Unable to delete review.");
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await APIService.markReviewHelpful(reviewId);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r));
    } catch { }
  };

  const openEditForm = () => {
    if (!myReview) return;
    setFormRating(myReview.rating);
    setFormTitle(myReview.title || "");
    setFormText(myReview.review_text || "");
    setEditMode(true);
    setShowForm(true);
  };

  const total = pagination.total || reviews.length;

  return (
    <section className="pr-section">
      {/* ── Header ── */}
      <div className="pr-header">
        <h2 className="pr-title">Customer Reviews</h2>
        {token && !myReview && !showForm && (
          <button className="pr-write-btn" onClick={() => { setShowForm(true); setEditMode(false); }}>
            ✏️ Write a Review
          </button>
        )}
        {token && myReview && (
          <div className="pr-my-actions">
            <button className="pr-edit-btn" onClick={openEditForm}>✏️ Edit My Review</button>
            <button className="pr-delete-btn" onClick={handleDeleteReview}>🗑 Delete</button>
          </div>
        )}
      </div>

      {/* ── Rating summary ── */}
      <div className="pr-summary">
        <div className="pr-summary-score">
          <div className="pr-big-rating">{Number(productRating || 0).toFixed(1)}</div>
          <Stars rating={Math.round(productRating || 0)} size={24} />
          <div className="pr-total-count">{total} review{total !== 1 ? "s" : ""}</div>
        </div>
        <div className="pr-summary-bars">
          {[5, 4, 3, 2, 1].map(s => (
            <RatingBar key={s} star={s} count={breakdown[s]} total={total} />
          ))}
        </div>
      </div>

      {/* ── Write/Edit form ── */}
      {showForm && (
        <div className="pr-form-card">
          <h3 className="pr-form-title">{editMode ? "Edit Your Review" : "Write a Review"}</h3>
          {formError && <p className="pr-form-error">{formError}</p>}
          {formSuccess && <p className="pr-form-success">{formSuccess}</p>}
          <form onSubmit={handleSubmitReview} className="pr-form">
            <div className="pr-form-group">
              <label>Your Rating *</label>
              <Stars rating={formRating} size={32} interactive onRate={setFormRating} />
            </div>
            <div className="pr-form-group">
              <label>Review Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Sum it up in a few words..."
              />
            </div>
            <div className="pr-form-group">
              <label>Your Review</label>
              <textarea
                rows={4}
                value={formText}
                onChange={e => setFormText(e.target.value)}
                placeholder="Tell others what you think about this product..."
              />
            </div>
            <div className="pr-form-actions">
              <button type="button" className="pr-cancel-btn" onClick={() => { setShowForm(false); setFormError(""); }}>
                Cancel
              </button>
              <button type="submit" className="pr-submit-btn" disabled={submitting}>
                {submitting ? "Submitting..." : editMode ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Sort controls ── */}
      {reviews.length > 0 && (
        <>
          <hr style={{ border: 'none', borderTop: '2px solid #DECCFE', margin: '0 0 20px' }} />
          <div className="pr-controls">
            <span className="pr-controls-label">Sort by:</span>
            {[
              { value: "newest", label: "Newest" },
              { value: "helpful", label: "Most Helpful" },
              { value: "rating_high", label: "Highest Rated" },
              { value: "rating_low", label: "Lowest Rated" },
            ].map(opt => (
              <button
                key={opt.value}
                className={`pr-sort-btn ${sort === opt.value ? "pr-sort-btn--active" : ""}`}
                onClick={() => handleSortChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Reviews list ── */}
      {loading && <div className="pr-loading">Loading reviews...</div>}

      {!loading && reviews.length === 0 && (
        <div className="pr-empty">
          <div className="pr-empty-icon">⭐</div>
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      <div className="pr-list">
        {reviews.map((review) => (
          <div key={review.id} className={`pr-card ${review.id === myReview?.id ? "pr-card--mine" : ""}`}>
            <div className="pr-card-top">
              <div className="pr-avatar">{review.User?.name?.charAt(0)?.toUpperCase() || "U"}</div>
              <div className="pr-card-meta">
                <div className="pr-reviewer-name">
                  {review.User?.name || "Customer"}
                  {review.is_verified_purchase && (
                    <span className="pr-verified">✓ Verified Purchase</span>
                  )}
                  {review.id === myReview?.id && (
                    <span className="pr-mine-tag">Your Review</span>
                  )}
                </div>
                <div className="pr-card-date">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              <Stars rating={review.rating} size={16} />
            </div>

            {review.title && <p className="pr-review-title">{review.title}</p>}
            {review.review_text && <p className="pr-review-text">{review.review_text}</p>}

            <div className="pr-card-footer">
              <button className="pr-helpful-btn" onClick={() => handleHelpful(review.id)}>
                👍 Helpful ({review.helpful_count})
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
