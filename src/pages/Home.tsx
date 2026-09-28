import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllTools } from '../lib/toolStore';
import { Tool } from '../types';
import { cn } from '../lib/utils';
import { ToolCard } from '../components/ToolCard';
import ReviewModal from '../components/ReviewModal';
import AddToolModal from '../components/AddToolModal';
import { Plus, Sparkles, Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import { isAdminAuthenticated } from '../lib/adminAuth';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());

  const revealRefs = useRef<HTMLElement[]>([]);

  const loadTools = () => {
    setTools(getAllTools());
  };

  const loadReviews = () => {
    const stored = JSON.parse(localStorage.getItem('toolscout_global_reviews') || '[]');
    setGlobalReviews(stored.length > 0 ? stored : DEFAULT_REVIEWS);
  };

  useEffect(() => {
    loadTools();
    loadReviews();

    const handleToolsUpdated = () => loadTools();
    const handleAdminChanged = (e: any) => setIsAdmin(Boolean(e.detail));

    window.addEventListener('toolscout_tools_updated', handleToolsUpdated);
    window.addEventListener('toolscout_admin_changed', handleAdminChanged);

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
      window.removeEventListener('toolscout_tools_updated', handleToolsUpdated);
      window.removeEventListener('toolscout_admin_changed', handleAdminChanged);
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
    { id: '01', icon: '🎬', name: 'Video', desc: 'Generate, edit, and upscale videos', count: `${getCategoryCount('video')} tools`, cat: 'video' },
    { id: '02', icon: '🖼️', name: 'Image', desc: 'Transform and generate high-res visuals', count: `${getCategoryCount('image')} tools`, cat: 'image' },
    { id: '03', icon: '✍️', name: 'Writing', desc: 'SEO articles, copywriting, and prose', count: `${getCategoryCount('writing')} tools`, cat: 'writing' },
    { id: '04', icon: '🎙️', name: 'Audio', desc: 'Voice synthesis, music, and podcasts', count: `${getCategoryCount('audio')} tools`, cat: 'audio' },
    { id: '05', icon: '💻', name: 'Coding', desc: 'Autonomous devs and code assistants', count: `${getCategoryCount('coding')} tools`, cat: 'coding' },
    { id: '06', icon: '🎨', name: 'Design', desc: 'Logos, UI mockups, and visual assets', count: `${getCategoryCount('generation')} tools`, cat: 'generation' },
    { id: '07', icon: '⚡', name: 'Productivity', desc: 'Smart workflows and daily tasks', count: `${getCategoryCount('productivity')} tools`, cat: 'productivity' },
    { id: '08', icon: '📈', name: 'Marketing', desc: 'Campaign ads and social media growth', count: `${getCategoryCount('marketing')} tools`, cat: 'marketing' },
  ];

  const totalToolCount = tools.length || 200;
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
          <div className="hero-eyebrow flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            The AI Tools Directory — {totalToolCount} Tools Available
          </div>
          <h1 className="hero-headline">
            Find the<br />
            <span className="line-accent">right tool</span><br />
            <span className="line-outline">for anything.</span>
          </h1>
          <p className="hero-sub">
            Stop hoarding AI tools in messy saves. Describe what you need in plain English — we match you to the exact tool that solves it.
          </p>
          <div className="hero-actions flex-wrap gap-4">
            <button className="btn-primary" onClick={() => navigate('/browse')}>Browse All Tools →</button>
            <button
              onClick={() => navigate('/compare')}
              className="bg-black3 hover:bg-black4 border border-border text-white2 hover:text-white font-syne text-xs uppercase font-bold px-6 py-4 transition-all flex items-center gap-1.5"
            >
              <Layers size={14} className="text-accent" /> Compare Tools
            </button>
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-accent text-black font-syne text-xs uppercase font-bold px-5 py-4 transition-all flex items-center gap-2 shadow-lg shadow-accent/10"
              >
                <Plus size={15} /> + Add Website
              </button>
            )}
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
            {['remove background', 'edit video', 'voice clone', 'coding', 'agents'].map(hint => (
              <span key={hint} className="hint" onClick={() => navigate(`/browse?q=${encodeURIComponent(hint)}`)}>{hint}</span>
            ))}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num"><span>{totalToolCount}</span></div>
              <div className="hero-stat-label">Tools Listed</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num"><span>24</span></div>
              <div className="hero-stat-label">Categories</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num"><span>Live</span></div>
              <div className="hero-stat-label">Web Embeds</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num"><span>AI</span></div>
              <div className="hero-stat-label">Copilot Ready</div>
            </div>
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
        <div className="reveal mt-10 flex justify-center gap-4 flex-wrap" ref={addToReveal}>
          <button className="btn-primary bg-accent text-black border-none" onClick={() => navigate('/browse')}>
            View All {totalToolCount} Tools
          </button>
        </div>
      </section>

      {/* Category Use Cases Section */}
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
            <div key={cat.id} className="cat-row" onClick={() => navigate(`/browse?cat=${cat.cat}`)}>
              <span className="cat-row-num">{cat.id}</span>
              <span className="cat-row-icon">{cat.icon}</span>
              <span className="cat-row-name">{cat.name}</span>
              <span className="cat-row-desc">{cat.desc}</span>
              <span className="cat-row-count">{cat.count}</span>
              <span className="cat-arrow">→</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="section-row reveal" ref={addToReveal}>
          <div className="section-title-block">
            <div className="sec-label">Community Insights</div>
            <h2 className="sec-title">What creators<br /><em>are saying</em></h2>
          </div>
          <button className="btn-primary self-end" onClick={() => setIsReviewModalOpen(true)}>Add Your Review +</button>
        </div>
        <div className="testimonials-grid reveal" ref={addToReveal}>
          {globalReviews.map(r => (
            <div key={r.id} className="testimonial">
              <div className="text-[#f0c040] mb-3 text-base">{'★'.repeat(r.rating)}</div>
              <p className="testimonial-quote">"{r.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar bg-accent/10 text-accent">
                  {r.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="author-name">{r.name}</div>
                  <div className="author-role">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="section-row reveal" ref={addToReveal}>
          <div className="section-title-block">
            <div className="sec-label">FAQ</div>
            <h2 className="sec-title">Frequently<br /><em>asked questions</em></h2>
          </div>
        </div>
        <div className="faq-list reveal" ref={addToReveal}>
          {[
            { q: 'How do I find the best AI tool for my task?', a: 'You can use the natural language search bar at the top, browse by category, compare tools side-by-side, or click the floating "Ask Scout AI" button in the bottom right corner for instant recommendations.' },
            { q: 'How does live website embedding work?', a: 'On every tool\'s detail page, click the "Live Interactive Preview" tab. You can interact with the website inside desktop, tablet, and mobile device frames, and even generate embed codes for your own site or Notion.' },
            { q: 'What is Scout AI Copilot?', a: 'Scout AI is your personal directory assistant. Describe any problem, and it will recommend the best tools and step-by-step workflows.' },
            { q: 'How often is the directory updated?', a: 'The directory is continuously updated with the latest AI tools and models.' },
          ].map((faq, idx) => (
            <div key={idx} className={cn("faq-item", openFaq === idx && "open")}>
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                {faq.q}
                <span className="faq-icon">{openFaq === idx ? '−' : '+'}</span>
              </div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals & Toast */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={loadReviews}
      />
      {isAdmin && (
        <AddToolModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            loadTools();
          }}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent text-black font-syne text-xs uppercase font-bold px-6 py-3 rounded-full shadow-2xl z-[350] animate-fadeIn">
          {toast}
        </div>
      )}
    </div>
  );
}
