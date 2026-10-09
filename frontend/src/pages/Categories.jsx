import { Link } from 'react-router-dom';

const categories = [
  ['◒', 'Logos', 'Official marks, signatures, and identity assets.', 'LOGO'],
  ['▤', 'Posters', 'Ready-to-use event and campaign layouts.', 'POSTER'],
  ['▧', 'Templates', 'Flexible files for your next campus project.', 'TEMPLATE'],
  ['◫', 'Guidelines', 'Keep every communication on brand.', 'GUIDELINE'],
  ['Aa', 'Fonts', 'Approved typefaces for every touchpoint.', 'FONT'],
  ['●', 'Colors', 'The palette behind our campus identity.', 'COLOR'],
  ['◈', 'Other', 'Supplementary assets and miscellaneous collateral.', 'OTHER']
];

export default function Categories() {
  return (
    <main className="dashboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Explore the library</p>
          <h1>Categories</h1>
          <p className="intro">Browse all approved branding resources organized by type.</p>
        </div>
      </header>

      <section className="resource-section" style={{ padding: '36px 0', borderTop: 'none' }}>
        <div className="category-grid">
          {categories.map(([icon, name, description, value]) => (
            <Link className="category-card" to={`/assets?category=${value}`} key={name}>
              <span className="category-icon">{icon}</span>
              <h3>{name}</h3>
              <p>{description}</p>
              <span className="category-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
