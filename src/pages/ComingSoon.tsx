import { Link } from 'react-router-dom';

export default function ComingSoon() {
  return (
    <div className="page active">
      <div className="coming-soon-wrap">
        <div className="hero-eyebrow justify-center">Coming Soon</div>
        <h1>This page<br /><span className="text-accent italic font-normal font-body">is on its way.</span></h1>
        <p>We're working on it. Check back soon.</p>
        <Link to="/" className="btn-primary">← Back Home</Link>
      </div>
    </div>
  );
}
