import React, { useEffect, useState, useRef, useLayoutEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TOOLS } from '../constants';
import { Tool } from '../types';
import { cn } from '../lib/utils';
import { ToolCard } from '../components/ToolCard';
import ReviewModal from '../components/ReviewModal';

const DEFAULT_REVIEWS = [
  { id: 1, name: 'Sarah K.', role: 'Freelance Designer', text: 'Finally a directory that actually understands what I\'m looking for. Searched "make my photos look professional" and got exactly the right tools.', rating: 5, date: '2026-03-01' },
  { id: 2, name: 'Marcus T.', role: 'Startup Founder', text: 'Used to waste hours comparing AI tools. ToolScout cut that down to minutes. The intent-matching is genuinely different from anything else out there.', rating: 5, date: '2026-03-05' },
  { id: 3, name: 'Priya M.', role: 'Content Creator', text: 'The category breakdown and tagging system makes it so easy to discover tools I never would have found otherwise. Bookmarking everything!', rating: 5, date: '2026-03-10' },
];

export default function Home() {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [globalReviews, setGlobalReviews] = useState<any[]>(DEFAULT_REVIEWS);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tools] = useState<Tool[]>(TOOLS);

  const revealRefs = useRef<HTMLElement[]>([]);

  const loadReviews = () => {
    const stored = JSON.parse(localStorage.getItem('toolscout_global_reviews') || '[]');
    setGlobalReviews(stored.length > 0 ? stored : DEFAULT_REVIEWS);
  };

  useLayoutEffect(() => {
    loadReviews();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    revealRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });

    const handleToast = (e: any) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener('show-toast', handleToast);

    return () => {
      observer.disconnect();
      window.removeEventListener('show-toast', handleToast);
    };
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) navigate(`/browse?q=${encodeURIComponent(heroSearch)}`);
  };

  const getCategoryCount = (cat: string) => tools.filter(t => t.cat === cat).length;

  const categories = [
    { id: '01', icon: '🎬', name: 'Video', desc: 'Generate and edit video content', count: `${getCategoryCount('video')} tools`, cat: 'video' },
    { id: '02', icon: '🖼️', name: 'Image', desc: 'Edit and generate visuals', count: `${getCategoryCount('image')} tools`, cat: 'image' },
    { id: '03', icon: '✍️', name: 'Writing', desc: 'Copy, blogs, and marketing content', count: `${getCategoryCount('writing')} tools`, cat: 'writing' },
    { id: '04', icon: '🎙️', name: 'Audio', desc: 'Voice synthesis and music', count: `${getCategoryCount('audio')} tools`, cat: 'audio' },
    { id: '05', icon: '💻', name: 'Coding', desc: 'Build apps and websites', count: `${getCategoryCount('coding')} tools`, cat: 'coding' },
    { id: '06', icon: '🎨', name: 'Design', desc: 'Logos and brand identity', count: `${getCategoryCount('generation')} tools`, cat: 'generation' },
    { id: '07', icon: '⚡', name: 'Productivity', desc: 'Workflows and AI agents', count: `${getCategoryCount('productivity')} tools`, cat: 'productivity' },
    { id: '08', icon: '📈', name: 'Marketing', desc: 'Product photos and ads', count: `${getCategoryCount('marketing')} tools`, cat: 'marketing' },
  ];

  const featuredTools = tools.filter(t => t.featured).slice(0, 6);

  const addToReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  return (
    <div className="page active">
      <div className="ticker-wrap mt-[70px]">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="ticker-item"><span className="ticker-sep"></span>Video Generation</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Image Editing</span>
              <span className="ticker-item"><span className="ticker-sep"></span>AI Writing</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Voice Synthesis</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Code Automation</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Design Tools</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Data Analytics</span>
              <span className="ticker-item"><span className="ticker-sep"></span>E-commerce AI</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Transcription</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Productivity</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <section className="hero">
        <div className="hero-left reveal" ref={addToReveal}>
          <div className="hero-eyebrow">The AI Tools Directory — Growing Every Day</div>
          <h1 className="hero-headline">
            Find the<br />
            <span className="line-accent">right tool</span><br />
            <span className="line-outline">for anything.</span>
          </h1>
          <p className="hero-sub">Stop hoarding AI tools in messy Instagram saves. Describe what you need — we match you to the exact tool that solves it.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/browse')}>Browse All Tools →</button>
            <button className="btn-ghost" onClick={() => navigate('/how-it-works')}>How it works</button>
          </div>
        </div>
        <div className="hero-right reveal" ref={addToReveal}>
          <form onSubmit={handleHeroSearch} className="search-box">
            <input
              type="text"
              placeholder="e.g. make my videos look cinematic…"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
            />
            <button type="submit" className="search-go">Search</button>
          </form>
          <div className="hint-row">
            {['remove background', 'edit video', 'voice clone', 'design'].map(hint => (
              <span key={hint} className="hint" onClick={() => navigate(`/browse?q=${encodeURIComponent(hint)}`)}>{hint}</span>
            ))}
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-num"><span>200</span></div><div className="hero-stat-label">Tools Listed</div></div>
            <div className="hero-stat"><div className="hero-stat-num"><span>20</span></div><div className="hero-stat-label">Categories</div></div>
            <div className="hero-stat"><div className="hero-stat-num"><span>Free</span></div><div className="hero-stat-label">To Search</div></div>
            <div className="hero-stat"><div className="hero-stat-num"><span>24h</span></div><div className="hero-stat-label">Listing Review</div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-row reveal" ref={addToReveal}>
          <div className="section-title-block">
            <div className="sec-label">Featured This Week</div>
            <h2 className="sec-title">Tools people<br /><em>love right now</em></h2>
            <p className="sec-desc !text-left !self-start mt-4">Curated, tested, and tagged so you find what you actually need — not just what's most popular.</p>
          </div>
        </div>
        <div className="tools-grid reveal" ref={addToReveal}>
          {featuredTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
        <div className="reveal mt-10 flex justify-center" ref={addToReveal}>
          <button className="btn-primary bg-accent text-black border-none" onClick={() => navigate('/browse')}>View All Tools</button>
        </div>
      </section>

      <section className="section !pt-0">
        <div className="cat-scroll -mx-12 mb-[60px] border-t-0">
          <div className="cat-scroll-inner">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                <div className="cat-scroll-item">🎬 Video <span className="cat-num">{getCategoryCount('video')}</span></div>
                <div className="cat-scroll-item">🖼️ Image <span className="cat-num">{getCategoryCount('image')}</span></div>
                <div className="cat-scroll-item">✍️ Writing <span className="cat-num">{getCategoryCount('writing')}</span></div>
                <div className="cat-scroll-item">🎙️ Audio <span className="cat-num">{getCategoryCount('audio')}</span></div>
                <div className="cat-scroll-item">🎨 Design <span className="cat-num">{getCategoryCount('generation')}</span></div>
                <div className="cat-scroll-item">💻 Code <span className="cat-num">{getCategoryCount('coding')}</span></div>
                <div className="cat-scroll-item">🤖 Agent <span className="cat-num">{getCategoryCount('agent')}</span></div>
                <div className="cat-scroll-item">📊 Data <span className="cat-num">{getCategoryCount('data')}</span></div>
                <div className="cat-scroll-item">⚖️ Finance <span className="cat-num">{getCategoryCount('finance')}</span></div>
                <div className="cat-scroll-item">🧠 Productivity <span className="cat-num">{getCategoryCount('productivity')}</span></div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="section-row reveal" ref={addToReveal}>
          <div className="section-title-block">
            <div className="sec-label">Browse by Goal</div>
            <h2 className="sec-title">What are we<br /><em>trying to do?</em></h2>
          </div>
          <button className="btn-primary self-end" onClick={() => navigate('/categories')}>All Categories →</button>
        </div>
        <div className="cat-list reveal" ref={addToReveal}>
          {categories.map(cat => (
            <Link key={cat.id} to={`/browse?cat=${cat.cat}`} className="cat-row">
              <span className="cat-row-num">{cat.id}</span>
              <span className="cat-row-icon">{cat.icon}</span>
              <span className="cat-row-name">{cat.name}</span>
              <span className="cat-row-desc">{cat.desc}</span>
              <span className="cat-row-count">{cat.count}</span>
              <span className="cat-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section border-t border-border">
        <div className="section-row reveal" ref={addToReveal}>
          <div className="section-title-block">
            <div className="sec-label">Real Users</div>
            <h2 className="sec-title">What they're<br /><em>saying</em></h2>
          </div>
        </div>
        <div className="testimonials-grid reveal" ref={addToReveal}>
          {globalReviews.map((r, i) => (
            <div key={r.id || i} className="testimonial">
              <p className="testimonial-quote">{r.text}</p>
              <div className="testimonial-author">
                <div
                  className="author-avatar"
                  style={{
                    backgroundColor: i % 3 === 0 ? 'rgba(200,255,0,0.12)' : i % 3 === 1 ? 'rgba(255,69,0,0.12)' : 'rgba(255,255,255,0.06)',
                    color: i % 3 === 0 ? 'var(--accent)' : i % 3 === 1 ? 'var(--accent2)' : 'var(--white2)'
                  }}
                >
                  {r.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <div className="author-name">{r.name}</div>
                  <div className="author-role">{r.role || 'ToolScout User'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="reveal mt-10 flex justify-center" ref={addToReveal}>
          <button className="btn-primary bg-accent text-black border-none" onClick={() => setIsReviewModalOpen(true)}>Leave a Review</button>
        </div>
      </section>

      <section className="section">
        <div className="section-row reveal" ref={addToReveal}>
          <div className="section-title-block">
            <div className="sec-label">Common Questions</div>
            <h2 className="sec-title">FAQ</h2>
          </div>
        </div>
        <div className="faq-list reveal" ref={addToReveal}>
          {[
            { q: "Is searching for tools really free?", a: "Yes, always. Users search, browse, compare, bookmark, and review tools at zero cost. We charge founders for premium placement — never users for discovery." },
            { q: "How is this different from other AI directories?", a: "Most directories are keyword-based — you have to know the tool's name. ToolScout uses intent-matching: describe a problem in plain English and we map it to tools by meaning. We also curate — we only list tools we've verified." },
            { q: "How often is the directory updated?", a: "We update our directory daily with new tools and verified reviews to keep you at the cutting edge of AI." },
            { q: "Can I submit my own AI tool?", a: "Absolutely! We love discovering new tools. Use the 'List Your Tool' section below to submit your tool for review." },
            { q: "Are the reviews from real users?", a: "Yes, all reviews are submitted by real users and verified by our team to ensure authenticity and helpfulness." }
          ].map((faq, i) => (
            <div key={i} className={cn("faq-item", openFaq === i && "open")}>
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="faq-q-text">{faq.q}</span>
                <span className="faq-toggle">{openFaq === i ? '×' : '+'}</span>
              </div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section border-t border-border">
        <div className="section-row reveal" ref={addToReveal}>
          <div className="section-title-block">
            <div className="sec-label">Grow the community</div>
            <h2 className="sec-title">List your<br /><em>AI tool</em></h2>
            <p className="sec-desc !text-left !self-start mt-4">Help others discover the best AI tools. Submit a tool you love or one you've built. Every submission is reviewed by our team using AI to ensure quality and legitimacy.</p>
          </div>
          <div className="self-end">
            <a
              href="https://tally.so/r/KYJ88M"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Submit Tool →
            </a>
          </div>
        </div>
      </section>

      <div className="cta-strip">
        <h2 className="cta-title reveal" ref={addToReveal}>Find your<br /><span className="acc">AI toolkit</span><br /><span className="out">today.</span></h2>
        <div className="reveal flex gap-4 flex-wrap" ref={addToReveal}>
          <button className="btn-primary" onClick={() => navigate('/browse')}>Browse Tools →</button>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={loadReviews}
      />

      {toast && (
        <div className="toast show">{toast}</div>
      )}
    </div>
  );
}
