import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants';

export default function Categories() {
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    revealRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  const addToReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const aggregates: Record<string, { cat: string; icon: string; count: number }> = {};
  TOOLS.forEach(t => {
    if (!aggregates[t.catLabel]) aggregates[t.catLabel] = { cat: t.cat, icon: t.icon, count: 0 };
    aggregates[t.catLabel].count++;
  });

  return (
    <div className="page active">
      <div className="ticker-wrap mt-[70px]">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="ticker-item"><span className="ticker-sep"></span>Browse Categories</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Video Tools</span>
              <span className="ticker-item"><span className="ticker-sep"></span>AI Writing</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Image Editing</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Automation</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <section className="section min-h-[80vh]">
        <div className="section-row reveal" ref={addToReveal}>
          <div className="section-title-block">
            <div className="sec-label">Browse by Goal</div>
            <h2 className="sec-title">What are we<br /><em>trying to do?</em></h2>
          </div>
          <Link to="/browse" className="btn-primary self-end">All Tools →</Link>
        </div>
        <div className="cat-list reveal" ref={addToReveal}>
          {Object.keys(aggregates).map((name, idx) => {
            const agg = aggregates[name];
            const num = (idx + 1 < 10 ? '0' : '') + (idx + 1);
            return (
              <Link key={name} to={`/browse?cat=${agg.cat}`} className="cat-row">
                <span className="cat-row-num">{num}</span>
                <span className="cat-row-icon">{agg.icon}</span>
                <span className="cat-row-name">{name}</span>
                <span className="cat-row-desc">Tools tailored for {name}</span>
                <span className="cat-row-count">{agg.count} tools</span>
                <span className="cat-arrow">→</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
