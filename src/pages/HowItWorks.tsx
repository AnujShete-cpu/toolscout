import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
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

  return (
    <div className="page active">
      <div className="ticker-wrap mt-[70px]">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="ticker-item"><span className="ticker-sep"></span>How It Works</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Intent Matching</span>
              <span className="ticker-item"><span className="ticker-sep"></span>AI Discovery</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Verified Tools</span>
              <span className="ticker-item"><span className="ticker-sep"></span>User Reviews</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <section className="section min-h-[80vh]">
        <div className="section-row reveal" ref={addToReveal}>
          <div className="section-title-block">
            <div className="sec-label">How ToolScout Works</div>
            <h2 className="sec-title">Stop searching.<br /><em>Start finding.</em></h2>
          </div>
        </div>
        <div className="how-grid mb-[60px] reveal" ref={addToReveal}>
          <div className="how-step">
            <div className="how-step-num">01</div>
            <div className="how-step-icon">💬</div>
            <div className="how-step-title">Describe the Problem</div>
            <div className="how-step-desc">Don't search for "notion clone". Search for "I need a place to organize my team's messy docs." Our AI understands intent.</div>
          </div>
          <div className="how-step">
            <div className="how-step-num">02</div>
            <div className="how-step-icon">🎯</div>
            <div className="how-step-title">Get Matched</div>
            <div className="how-step-desc">Instantly see the exact tools that solve your specific problem, ranked by user reviews and real-world utility.</div>
          </div>
          <div className="how-step">
            <div className="how-step-num">03</div>
            <div className="how-step-icon">⚖️</div>
            <div className="how-step-title">Compare Quickly</div>
            <div className="how-step-desc">See pricing, free tiers, and key features at a glance. No more digging through pricing pages to find the hidden catch.</div>
          </div>
          <div className="how-step">
            <div className="how-step-num">04</div>
            <div className="how-step-icon">🤍</div>
            <div className="how-step-title">Save for Later</div>
            <div className="how-step-desc">Build your personal toolkit. Bookmark the tools you love so you never lose them when you actually need them.</div>
          </div>
        </div>
        <div className="text-center reveal" ref={addToReveal}>
          <Link to="/browse" className="btn-primary bg-accent text-black border-none py-[18px] px-[48px] text-base">START SEARCHING →</Link>
        </div>
      </section>
    </div>
  );
}
