import { useEffect, useRef } from "react";
import "./About.css";

/* ── Tiny helper: animate elements when they scroll into view ── */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("revealed")),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

/* ── Data ── */
const features = [
  { emoji: "🧸", title: "Curated Toy Collection", desc: "Every toy on ToyCart is hand-picked for quality, safety, and fun. From classic wooden toys to the latest trending picks." },
  { emoji: "🔒", title: "Safe & Secure Shopping", desc: "Your data and payments are fully protected. Shop with confidence knowing your family's information is always safe." },
  { emoji: "🚀", title: "Fast & Easy Checkout", desc: "Add to cart, review your order, and place it in seconds. We've made the checkout experience as smooth as possible." },
  { emoji: "📦", title: "Order Tracking", desc: "Stay informed every step of the way. View your order status and history right from your account dashboard." },
  { emoji: "🎨", title: "Category Browsing", desc: "Explore toys by category, age group, and price. Finding the perfect gift has never been easier." },
  { emoji: "💬", title: "Admin-Powered Management", desc: "Our admin team keeps the catalogue fresh — adding new products, updating details, and managing orders daily." },
];

const steps = [
  { num: "01", title: "Browse & Discover", desc: "Explore our catalogue of toys across categories, use filters to narrow down by price or availability." },
  { num: "02", title: "Add to Cart", desc: "Found something your child will love? Add it to your cart, adjust quantities, and keep shopping." },
  { num: "03", title: "Checkout Easily", desc: "Fill in your delivery details, review your order summary, and place your order in just a few taps." },
  { num: "04", title: "Delivered with Joy", desc: "Your order is confirmed, tracked, and delivered. Happiness guaranteed — or we'll make it right." },
];

const stats = [
  { value: "500+", label: "Toys in Catalogue" },
  { value: "2", label: "User Roles" },
  { value: "100%", label: "Secure Checkout" },
  { value: "∞", label: "Smiles Delivered" },
];

const About = () => {
  useReveal();

  return (
    <div className="about-page">

      {/* ── HERO ── */}
      <section className="about-hero">
        {/* Decorative blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="about-hero-inner">
          <div className="about-hero-badge reveal">🛒 About ToyCart</div>
          <h1 className="about-hero-title reveal">
            Where Every Child's <br />
            <span className="title-highlight">Joy Begins</span>
          </h1>
          <p className="about-hero-sub reveal">
            ToyCart is a thoughtfully designed e-commerce platform built to
            bring the best toys to families — safely, easily, and joyfully.
            Browse, cart, and checkout in minutes.
          </p>
          <div className="hero-toy-row reveal">
            {["🪀", "🧩", "🪁", "🎪", "🧸", "🎠", "🎯", "🎲"].map((t, i) => (
              <span key={i} className="float-toy" style={{ animationDelay: `${i * 0.15}s` }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="wave-divider wave-hero">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#F0EDFF" />
          </svg>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="about-mission">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-text reveal">
              <span className="section-eyebrow">Our Mission</span>
              <h2>Making Playtime <span className="ocean-text">Effortless</span></h2>
              <p>
                ToyCart was built with a single goal: make finding and buying the
                perfect toy as fun as playing with it. We believe every child
                deserves access to quality toys, and every parent deserves a
                shopping experience that doesn't feel like a chore.
              </p>
              <p>
                Our platform is designed for two kinds of users — <strong>customers</strong> who
                want a delightful shopping experience, and <strong>admins</strong> who
                need powerful tools to manage products, orders, and customers all
                in one place.
              </p>
            </div>
            <div className="mission-cards reveal">
              <div className="mission-card lemon-card">
                <span className="mc-icon">👶</span>
                <h4>For Customers</h4>
                <p>Browse, search, add to cart, checkout, and track orders — all from a clean, mobile-friendly interface.</p>
              </div>
              <div className="mission-card blush-card">
                <span className="mc-icon">🛠️</span>
                <h4>For Admins</h4>
                <p>Manage your entire catalogue, view all orders, and oversee customer activity from a secure dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="about-stats">
        <div className="container">
          <div className="stats-strip">
            {stats.map((s, i) => (
              <div className="stat-pill reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="stat-pill-value">{s.value}</span>
                <span className="stat-pill-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="about-features">
        <div className="wave-divider wave-top-lavender">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,0 1080,80 1440,40 L1440,0 L0,0 Z" fill="#F0EDFF" />
          </svg>
        </div>

        <div className="container">
          <div className="section-header-center reveal">
            <span className="section-eyebrow">What We Offer</span>
            <h2>Everything You Need, <span className="ocean-text">Nothing You Don't</span></h2>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card reveal" key={i} style={{ animationDelay: `${(i % 3) * 0.1}s` }}>
                <div className="feature-emoji">{f.emoji}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="wave-divider wave-bottom-lavender">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#F0EDFF" />
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="about-how">
        <div className="container">
          <div className="section-header-center reveal">
            <span className="section-eyebrow">How It Works</span>
            <h2>Shop in <span className="ocean-text">4 Simple Steps</span></h2>
          </div>

          <div className="steps-track">
            {steps.map((s, i) => (
              <div className="step-item reveal" key={i} style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="step-num">{s.num}</div>
                <div className="step-connector" />
                <div className="step-body">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES EXPLAINER ── */}
      <section className="about-roles">
        <div className="wave-divider wave-top-blush">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C480,80 960,0 1440,40 L1440,0 L0,0 Z" fill="#F0EDFF" />
          </svg>
        </div>

        <div className="container">
          <div className="section-header-center reveal">
            <span className="section-eyebrow">User Roles</span>
            <h2>Built for <span className="ocean-text">Two Worlds</span></h2>
          </div>

          <div className="roles-grid">
            {/* Customer */}
            <div className="role-card customer-role reveal">
              <div className="role-icon-wrap">🧒</div>
              <h3>Customer</h3>
              <ul className="role-list">
                {[
                  "Browse featured & latest products",
                  "Search and filter toys",
                  "View detailed product pages",
                  "Add items to cart & update quantities",
                  "Complete checkout with order summary",
                  "Receive order confirmation",
                ].map((item, i) => (
                  <li key={i}><span className="check">✓</span>{item}</li>
                ))}
              </ul>
            </div>

            {/* Divider toy */}
            <div className="roles-divider reveal">
              <span>🎁</span>
              <div className="roles-divider-line" />
              <span>VS</span>
              <div className="roles-divider-line" />
              <span>🛠️</span>
            </div>

            {/* Admin */}
            <div className="role-card admin-role reveal">
              <div className="role-icon-wrap">👩‍💼</div>
              <h3>Admin</h3>
              <ul className="role-list">
                {[
                  "Secure login to admin dashboard",
                  "Add, edit, and remove products",
                  "Manage product categories & images",
                  "View and manage all orders",
                  "Update order status in real time",
                  "View registered customers & history",
                ].map((item, i) => (
                  <li key={i}><span className="check ocean-check">✓</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="wave-divider wave-bottom-blush">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C480,0 960,80 1440,40 L1440,80 L0,80 Z" fill="#F0EDFF" />
          </svg>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-box reveal">
            <div className="cta-toys">
              {["🪀","🧸","🎯","🧩","🎪","🪁"].map((t,i) => (
                <span key={i} className="cta-float-toy" style={{ animationDelay: `${i*0.2}s` }}>{t}</span>
              ))}
            </div>
            <h2>Ready to Explore ToyCart?</h2>
            <p>Start browsing hundreds of toys — for every age, every budget, and every smile.</p>
            <div className="cta-btns">
              <a href="/" className="cta-btn-primary">🛒 Shop Now</a>
              <a href="/all-toys" className="cta-btn-secondary">Browse All Toys →</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
