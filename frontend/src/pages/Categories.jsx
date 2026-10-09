import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const categoryMetadata = [
  {
    id: 'LOGO',
    title: 'Logos & Marks',
    description: 'Official university crests, primary logos, secondary wordmarks, and department emblems.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2 2 4-4" />
      </svg>
    ),
    badgeColor: '#4f46e5'
  },
  {
    id: 'POSTER',
    title: 'Posters & Media',
    description: 'Official campus event posters, social media banners, and campaign creative templates.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    badgeColor: '#0ea5e9'
  },
  {
    id: 'TEMPLATE',
    title: 'Templates',
    description: 'Slide decks, letterheads, certificates, and pre-formatted document templates.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    badgeColor: '#10b981'
  },
  {
    id: 'GUIDELINE',
    title: 'Brand Guidelines',
    description: 'Clear rules on color values, clearspace, typography rules, and co-branding standards.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    badgeColor: '#f59e0b'
  },
  {
    id: 'FONT',
    title: 'Typography & Fonts',
    description: 'Approved collegiate typefaces, weights, webfont packages, and installation notes.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
    badgeColor: '#8b5cf6'
  },
  {
    id: 'COLOR',
    title: 'Color Palettes',
    description: 'Hex, RGB, and CMYK color codes for primary, secondary, and accent campus palettes.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 0-20" />
      </svg>
    ),
    badgeColor: '#ec4899'
  },
  {
    id: 'OTHER',
    title: 'Other Resources',
    description: 'Supplementary assets, icon packs, 3D emblems, and miscellaneous brand collateral.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    badgeColor: '#64748b'
  }
];

export default function Categories() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assets')
      .then((res) => {
        const acc = {};
        res.data.forEach((asset) => {
          acc[asset.category] = (acc[asset.category] || 0) + 1;
        });
        setCounts(acc);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <header className="page-header-block">
        <div>
          <span className="eyebrow-tag">CATEGORIES DIRECTORY</span>
          <h1 className="page-heading">Brand Categories</h1>
          <p className="page-subheading">
            Explore approved brand resources organized by type and format.
          </p>
        </div>
      </header>

      <div className="categories-card-grid">
        {categoryMetadata.map((cat) => {
          const count = counts[cat.id] || 0;
          return (
            <Link
              to={`/assets?category=${cat.id}`}
              key={cat.id}
              className="category-showcase-card"
            >
              <div className="category-showcase-header">
                <div className="category-icon-bubble" style={{ color: cat.badgeColor }}>
                  {cat.icon}
                </div>
                <span className="category-asset-count">
                  {loading ? '...' : `${count} ${count === 1 ? 'asset' : 'assets'}`}
                </span>
              </div>
              <h3 className="category-showcase-title">{cat.title}</h3>
              <p className="category-showcase-desc">{cat.description}</p>
              <div className="category-showcase-footer">
                <span>Browse assets</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

