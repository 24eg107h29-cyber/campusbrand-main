import { Link } from 'react-router-dom';

const categories = [
  ['◒', 'Logos & Marks', 'Official university crests, signatures, and identity marks.', 'LOGO'],
  ['▤', 'Posters & Media', 'Ready-to-use campus event banners and campaign layouts.', 'POSTER'],
  ['▧', 'Templates', 'Flexible decks, letterheads, and document files.', 'TEMPLATE'],
  ['◫', 'Guidelines', 'Comprehensive standards to keep communications on brand.', 'GUIDELINE'],
  ['Aa', 'Fonts & Type', 'Approved collegiate typefaces and font packages.', 'FONT'],
  ['●', 'Color Schemes', 'Primary, secondary, and accent campus color palettes.', 'COLOR']
];

export default function Landing() {
  return (
    <div className="landing-shell">
      {/* Public Top Navbar */}
      <header className="landing-nav">
        <Link to="/" className="brand-badge">
          <span className="brand-badge-icon">CB</span>
          <span className="brand-badge-text">Campus<strong>Brand</strong></span>
        </Link>
        <nav className="landing-nav-links">
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
          <Link to="/login" className="nav-signin-link">Sign In</Link>
          <Link to="/register" className="button-link primary-cta compact-cta">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="eyebrow-tag">CAMPUS DESIGN RESOURCE PORTAL</span>
          <h1 className="landing-hero-heading">
            Your Campus.<br />
            <span className="hero-heading-gradient">Your Identity.</span>
          </h1>
          <p className="landing-hero-desc">
            A centralized digital asset management platform for university branding, official vector marks, event posters, and design standards.
          </p>

          <div className="landing-hero-actions">
            <Link to="/login" className="button-link primary-cta">
              <span>Explore Assets</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link to="/register" className="button-link secondary-btn">
              <span>Create Account</span>
            </Link>
          </div>

          <div className="landing-proof-row">
            <div className="avatar-stack">
              <span>C</span>
              <span>B</span>
              <span>U</span>
            </div>
            <p>Empowering designers, faculty, and student leaders across campus.</p>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="visual-card-ambient" />
          <div className="visual-card-primary">
            <div className="visual-card-top">
              <span className="card-tag">OFFICIAL BRAND KIT</span>
              <span className="card-badge">2024 / 2025</span>
            </div>
            <div className="visual-crest-circle">
              <span>CB</span>
            </div>
            <h3>University Brand Resources</h3>
            <p>Access high-resolution vector logos, approved color palettes, and certified event posters.</p>
            <div className="visual-card-foot">
              <span>Standardized Design System</span>
              <span className="arrow-chip">↗</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="landing-resources-section" id="resources">
        <div className="section-title-row">
          <div>
            <span className="eyebrow-tag">RESOURCE DIRECTORY</span>
            <h2 className="section-heading-text">Core Brand Assets</h2>
          </div>
          <Link to="/login" className="inline-arrow-link">
            <span>Browse library</span>
            <span>↗</span>
          </Link>
        </div>

        <div className="landing-category-grid">
          {categories.map(([icon, name, description, value]) => (
            <Link to={`/login?category=${value}`} key={name} className="landing-cat-card">
              <div className="landing-cat-icon">{icon}</div>
              <h3>{name}</h3>
              <p>{description}</p>
              <span className="landing-cat-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-block" id="about">
        <div className="landing-footer-left">
          <Link to="/" className="brand-badge">
            <span className="brand-badge-icon">CB</span>
            <span className="brand-badge-text">Campus<strong>Brand</strong></span>
          </Link>
          <p>Official collegiate branding and digital asset repository.</p>
        </div>
        <div className="landing-footer-right">
          <span>&copy; {new Date().getFullYear()} CampusBrand. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
