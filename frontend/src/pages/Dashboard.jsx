import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Good morning, {user?.name?.split(' ')[0] || 'designer'}</p>
          <h1>Welcome to your<br /><em>creative space.</em></h1>
          <p className="intro">Everything you need to create consistently and keep our campus identity strong.</p>
          <Link className="button-link" to="/assets">Browse all assets <span>→</span></Link>
        </div>
        <div className="dashboard-visual"><span>BRAND<br /><strong>GUIDE</strong></span><small>2024 / 2025</small><i>✦</i></div>
      </section>
      <section className="dashboard-section" id="categories">
        <div className="section-heading"><div><p className="eyebrow">Explore the library</p><h2>Find what you need</h2></div><Link className="arrow-link" to="/assets">View all <span>↗</span></Link></div>
        <div className="quick-grid">
          <Link to="/assets?category=LOGO" className="quick-card"><span>◒</span><strong>Logos</strong><small>Identity marks</small></Link>
          <Link to="/assets?category=POSTER" className="quick-card"><span>▤</span><strong>Posters</strong><small>Event materials</small></Link>
          <Link to="/assets?category=TEMPLATE" className="quick-card"><span>▧</span><strong>Templates</strong><small>Ready to customize</small></Link>
          <Link to="/assets?category=GUIDELINE" className="quick-card"><span>◫</span><strong>Guidelines</strong><small>Stay on brand</small></Link>
        </div>
      </section>
      <section className="dashboard-callout">
        <div><p className="eyebrow">Create with confidence</p><h2>Good design starts<br />with the right <em>foundation.</em></h2></div>
        <Link className="button-link secondary-button" to="/assets">Explore the library <span>→</span></Link>
      </section>
    </main>
  );
}

export default Dashboard;
