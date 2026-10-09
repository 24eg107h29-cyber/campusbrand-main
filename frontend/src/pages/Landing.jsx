import { Link } from 'react-router-dom';

const categories = [
  ['◒', 'Logos', 'Official marks, signatures, and identity assets.', 'LOGO'],
  ['▤', 'Posters', 'Ready-to-use event and campaign layouts.', 'POSTER'],
  ['▧', 'Templates', 'Flexible files for your next campus project.', 'TEMPLATE'],
  ['◫', 'Guidelines', 'Keep every communication on brand.', 'GUIDELINE'],
  ['Aa', 'Fonts', 'Approved typefaces for every touchpoint.', 'FONT'],
  ['●', 'Colors', 'The palette behind our campus identity.', 'COLOR']
];

function Landing() {
  return (
    <main className="landing-page">
      <header className="public-nav">
        <Link className="brand-mark" to="/">
          <span className="brand-icon">C</span>
          <span>Campus<span>Brand</span></span>
        </Link>
        <nav>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
          <Link className="text-link" to="/login">Sign in</Link>
          <Link className="button-link compact-button" to="/register">Get started</Link>
        </nav>
      </header>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Campus design resource portal</p>
          <h1>Your campus.<br /><em>Your identity.</em></h1>
          <p className="hero-intro">A centralized platform for managing and accessing official college branding and design resources.</p>
          <div className="hero-actions">
            <Link className="button-link" to="/login">Explore assets <span>→</span></Link>
            <Link className="button-link secondary-button" to="/register">Create account</Link>
          </div>
          <div className="hero-proof">
            <span className="proof-avatars"><i>J</i><i>M</i><i>A</i></span>
            <span>Made for the people who<br /><strong>shape campus identity.</strong></span>
          </div>
        </div>
        <div className="hero-art" aria-label="CampusBrand resource preview">
          <div className="art-orbit"></div>
          <div className="art-card art-card-back">
            CAMPUS<br /><strong>BRAND</strong>
            <small>EST. 2024</small>
          </div>
          <div className="art-card art-card-front">
            <span className="art-label">BRAND KIT / 01</span>
            <div className="art-graphic"><span>C</span></div>
            <h3>Official<br /><em>identity.</em></h3>
            <small>Explore the collection →</small>
          </div>
          <span className="art-sticker">✦<br /><small>CREATE<br />WITH<br />PURPOSE</small></span>
        </div>
      </section>
      <section className="resource-section" id="resources">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Everything in one place</p>
            <h2>Design resources</h2>
          </div>
          <Link to="/login" className="arrow-link">View all assets <span>↗</span></Link>
        </div>
        <div className="category-grid">
          {categories.map(([icon, name, description, value]) => (
            <Link className="category-card" to={`/login?category=${value}`} key={name}>
              <span className="category-icon">{icon}</span>
              <h3>{name}</h3>
              <p>{description}</p>
              <span className="category-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="landing-footer" id="about">
        <span className="brand-mark">
          <span className="brand-icon">C</span>
          <span>Campus<span>Brand</span></span>
        </span>
        <span>Official resources for a stronger campus identity.</span>
        <span>© 2024 CampusBrand</span>
      </section>
    </main>
  );
}

export default Landing;
