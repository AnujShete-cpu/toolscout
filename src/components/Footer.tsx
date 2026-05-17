import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer aria-label="Site footer">

      {/* ── Main columns – grid / layout / branding unchanged ── */}
      <div className="footer-top">

        <div className="footer-logo-block">
          <Link to="/" className="logo" aria-label="ToolScout home">
            <span className="logo-dot" aria-hidden="true"></span>
            ToolScout
          </Link>
          <p>The intent-first AI tools directory. Find the right tool for any problem — not just the most popular one.</p>
        </div>

        <nav aria-labelledby="footer-nav-discover">
          <h3 id="footer-nav-discover" className="footer-col-title">Discover</h3>
          <ul className="footer-links">
            <li><Link to="/browse">Browse All</Link></li>
            <li><Link to="/browse?filter=featured">Featured</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/profile">My Saved List</Link></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-nav-founders">
          <h3 id="footer-nav-founders" className="footer-col-title">For Founders</h3>
          <ul className="footer-links">
            <li><Link to="/coming-soon">List Your Tool</Link></li>
            <li><Link to="/coming-soon">Pricing</Link></li>
            <li><Link to="/coming-soon">Analytics</Link></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-nav-company">
          <h3 id="footer-nav-company" className="footer-col-title">Company</h3>
          <ul className="footer-links">
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/coming-soon">Contact</Link></li>
          </ul>
        </nav>

      </div>

      {/* ── Free Tools SEO strip – sits between columns and bottom bar ── */}
      <nav className="footer-tools-strip" aria-labelledby="footer-nav-tools">
        <h3 id="footer-nav-tools" className="footer-tools-label">Free Tools</h3>
        <ul className="footer-tools-list" role="list">
          <li>
            <Link to="/word-counter" className="footer-tools-link">
              Word Counter
            </Link>
          </li>
          <li>
            <Link to="/image-compressor" className="footer-tools-link">
              Image Compressor
            </Link>
          </li>
          <li>
            <Link to="/code-formatter" className="footer-tools-link">
              Code Formatter
            </Link>
          </li>
        </ul>
      </nav>

      {/* ── Bottom bar – unchanged ── */}
      <div className="footer-bottom">
        <p>© 2026 Toolscout. The space of AI Tools.</p>
        <p>
          <Link to="/coming-soon">Privacy</Link> · <Link to="/coming-soon">Terms</Link>
        </p>
      </div>

    </footer>
  );
}
