import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-logo-block">
          <Link to="/" className="logo">
            <span className="logo-dot"></span>
            ToolScout
          </Link>
          <p>The intent-first AI tools directory. Find the right tool for any problem — not just the most popular one.</p>
        </div>
        <div>
          <div className="footer-col-title">Discover</div>
          <ul className="footer-links">
            <li><Link to="/browse">Browse All</Link></li>
            <li><Link to="/compare">Compare Tools</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/profile">Profile & Saved</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Resources</div>
          <ul className="footer-links">
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/how-it-works">Widget Embedding</Link></li>
            <li><Link to="/coming-soon">API & Integrations</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Company</div>
          <ul className="footer-links">
            <li><Link to="/how-it-works">About Us</Link></li>
            <li><Link to="/coming-soon">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 ToolScout. The Intelligent AI Tools Directory.</p>
        <p>
          <Link to="/coming-soon">Privacy</Link> · <Link to="/coming-soon">Terms</Link>
        </p>
      </div>
    </footer>
  );
}
