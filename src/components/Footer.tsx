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
            <li><Link to="/browse?filter=featured">Featured</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/profile">My Saved List</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">For Founders</div>
          <ul className="footer-links">
            <li><Link to="/coming-soon">List Your Tool</Link></li>
            <li><Link to="/coming-soon">Pricing</Link></li>
            <li><Link to="/coming-soon">Analytics</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Company</div>
          <ul className="footer-links">
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/coming-soon">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Toolscout. The Amazon of AI Tools.</p>
        <p>
          <Link to="/coming-soon">Privacy</Link> · <Link to="/coming-soon">Terms</Link>
        </p>
      </div>
    </footer>
  );
}
