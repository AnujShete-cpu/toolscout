import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToolById, getAllTools } from '../lib/toolStore';
import { Tool, Review } from '../types';
import { Heart, Code, ExternalLink, Monitor, Smartphone, Tablet, Maximize2, RefreshCw, Sparkles, Share2, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import EmbedWidgetModal from '../components/EmbedWidgetModal';
import { ToolCard } from '../components/ToolCard';

export default function ToolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  
  // Interactive Live Embed Viewport State
  const [activeTab, setActiveTab] = useState<'overview' | 'live-embed' | 'alternatives'>('overview');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [iframeBlockedNotice, setIframeBlockedNotice] = useState(false);

  const revealRefs = useRef<HTMLElement[]>([]);

  const loadReviews = (toolId: number) => {
    const all = JSON.parse(localStorage.getItem('toolscout_tool_reviews') || '[]');
    const toolReviews = all.filter((r: Review) => r.toolId === toolId);
    toolReviews.sort((a: Review, b: Review) => b.rating - a.rating);
    setReviews(toolReviews);
  };

  useEffect(() => {
    if (!id) return;
    const found = getToolById(parseInt(id));
    if (found) {
      setTool(found);
      loadReviews(found.id);
      const bookmarks = JSON.parse(localStorage.getItem('toolscout_bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(found.id));
    } else {
      navigate('/browse');
    }
  }, [id, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    revealRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [tool, activeTab]);

  const addToReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const toggleBookmark = () => {
    if (!tool) return;
    const bookmarks = JSON.parse(localStorage.getItem('toolscout_bookmarks') || '[]');
    const newBookmarks = isBookmarked
      ? bookmarks.filter((bid: number) => bid !== tool.id)
      : [...bookmarks, tool.id];
    localStorage.setItem('toolscout_bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
    
    const event = new CustomEvent('show-toast', {
      detail: isBookmarked ? 'Removed from bookmarks' : 'Bookmarked!'
    });
    window.dispatchEvent(event);
  };

  const submitReview = () => {
    if (!tool || !reviewName.trim() || !reviewText.trim()) return;
    const all = JSON.parse(localStorage.getItem('toolscout_tool_reviews') || '[]');
    const newReview: Review = {
      id: Date.now(),
      toolId: tool.id,
      name: reviewName.trim(),
      text: reviewText.trim(),
      rating: reviewRating,
      date: new Date().toISOString(),
    };
    localStorage.setItem('toolscout_tool_reviews', JSON.stringify([...all, newReview]));
    setReviewName('');
    setReviewText('');
    setReviewRating(5);
    loadReviews(tool.id);
  };

  if (!tool) return null;

  const allTools = getAllTools();
  const alternatives = allTools
    .filter(t => t.id !== tool.id && (t.cat === tool.cat || t.tags.some(tag => tool.tags.includes(tag))))
    .slice(0, 3);

  return (
    <div className="page active min-h-screen">
      {/* Hero Section */}
      <section className="tool-detail-hero">
        <div className="flex items-center justify-between gap-4 mb-4">
          <button className="tool-detail-back reveal" onClick={() => navigate('/browse')} ref={addToReveal}>
            <span className="text-xl">←</span> Back to directory
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/compare?tools=${tool.id}`)}
              className="bg-black3 hover:bg-black4 border border-border text-white text-xs font-syne uppercase font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Layers size={14} /> Compare Tool
            </button>
            <button
              onClick={() => setIsEmbedModalOpen(true)}
              className="bg-black3 hover:bg-black4 border border-border text-accent text-xs font-syne uppercase font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Code size={14} /> &lt;/&gt; Embed Widget
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="tool-icon-wrap !w-20 !h-20 !text-4xl shadow-xl">{tool.icon}</div>
          <div>
            <h1 className="hero-headline reveal !mb-2 !text-[clamp(32px,5vw,64px)]" ref={addToReveal}>
              {tool.name}
            </h1>
            <div className="tool-cat !text-sm flex items-center gap-2">
              <span>{tool.catLabel}</span>
              <span className="text-white3">•</span>
              <span className="text-white2 font-mono text-xs">{tool.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </div>
          </div>
        </div>

        <div className="tool-badges reveal !justify-start mb-6" ref={addToReveal}>
          <span className="badge bg-white/10 text-xs py-1.5 px-3">{tool.price}</span>
          <span className="badge bg-white/10 text-xs py-1.5 px-3">
            <span className="stars">{tool.stars}</span> {tool.rating} ({tool.ratingCount} reviews)
          </span>
          {tool.featured && (
            <span className="badge badge-feat text-xs py-1.5 px-3">★ Top Featured Pick</span>
          )}
        </div>

        <p className="hero-sub reveal !max-w-[700px] !text-lg" ref={addToReveal}>{tool.desc}</p>

        <div className="tool-tags reveal mb-8" ref={addToReveal}>
          {tool.tags.map(tag => (
            <span
              key={tag}
              className="tool-tag !text-xs !py-1.5 !px-3 hover:border-accent cursor-pointer"
              onClick={() => navigate(`/browse?q=${encodeURIComponent(tag)}`)}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="hero-actions reveal flex-wrap" ref={addToReveal}>
          <a href={tool.url} className="btn-primary" target="_blank" rel="noopener noreferrer">
            Visit Website ↗
          </a>
          <button
            onClick={() => setActiveTab('live-embed')}
            className="bg-black3 hover:bg-black4 border border-border text-white font-syne text-xs uppercase font-bold px-6 py-4 rounded-none transition-all flex items-center gap-2"
          >
            <Monitor size={16} /> Live Web Preview
          </button>
          <button
            className={cn("bookmark-btn !w-[54px] !h-[54px] !text-xl", isBookmarked && "saved")}
            onClick={toggleBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Heart size={20} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="border-b border-border bg-black2 sticky top-[70px] z-[100] px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 text-xs font-syne font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-accent text-accent'
                : 'border-transparent text-white3 hover:text-white'
            }`}
          >
            Overview & Reviews
          </button>
          <button
            onClick={() => setActiveTab('live-embed')}
            className={`py-4 text-xs font-syne font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'live-embed'
                ? 'border-accent text-accent'
                : 'border-transparent text-white3 hover:text-white'
            }`}
          >
            <Monitor size={14} /> Live Interactive Preview
          </button>
          <button
            onClick={() => setActiveTab('alternatives')}
            className={`py-4 text-xs font-syne font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'alternatives'
                ? 'border-accent text-accent'
                : 'border-transparent text-white3 hover:text-white'
            }`}
          >
            <Sparkles size={14} /> Top Alternatives ({alternatives.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Reviews */}
      {activeTab === 'overview' && (
        <section className="section border-t border-border">
          <div className="section-row reveal" ref={addToReveal}>
            <div className="section-title-block">
              <div className="sec-label">Community Insights</div>
              <h2 className="sec-title">What people<br /><em>think</em></h2>
            </div>
          </div>

          <div className="testimonials-grid reveal mb-12" ref={addToReveal}>
            {reviews.length > 0 ? (
              reviews.map((r, i) => (
                <div key={i} className="testimonial">
                  <div className="text-[#f0c040] mb-3 text-base">{'★'.repeat(r.rating)}</div>
                  <p className="testimonial-quote !text-sm">{r.text}</p>
                  <div className="testimonial-author">
                    <div className="author-avatar bg-accent/10 text-accent">
                      {r.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="author-name">{r.name}</div>
                      <div className="author-role">{new Date(r.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 bg-black2 border border-border rounded-xl text-white3 col-span-full text-center">
                No user reviews submitted yet. Share your experience with {tool.name} below!
              </div>
            )}
          </div>

          {/* Review Submission Form */}
          <div className="review-form reveal max-w-xl mx-auto" ref={addToReveal}>
            <h3 className="font-syne text-xl font-bold uppercase text-white mb-4">
              Leave a Review for {tool.name}
            </h3>
            <input
              type="text"
              placeholder="Your Name"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
            />
            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(parseInt(e.target.value))}
            >
              <option value="5">★★★★★ - 5 Stars (Exceptional)</option>
              <option value="4">★★★★☆ - 4 Stars (Great)</option>
              <option value="3">★★★☆☆ - 3 Stars (Good)</option>
              <option value="2">★★☆☆☆ - 2 Stars (Fair)</option>
              <option value="1">★☆☆☆☆ - 1 Star (Poor)</option>
            </select>
            <textarea
              placeholder="Write your honest review and use case..."
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button className="btn-primary w-full justify-center" onClick={submitReview}>
              Submit Review
            </button>
          </div>
        </section>
      )}

      {/* Tab 2: Live Web Preview & Sandbox */}
      {activeTab === 'live-embed' && (
        <section className="section !py-10 max-w-7xl mx-auto px-4">
          <div className="bg-black2 border border-border2 rounded-2xl overflow-hidden shadow-2xl">
            {/* Viewport Control Bar */}
            <div className="bg-black3 px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="font-syne text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
                  <Monitor size={15} className="text-accent" /> Live Web Sandbox
                </div>
                <span className="text-white3 text-xs hidden sm:inline">|</span>
                <span className="text-white3 text-xs font-mono hidden sm:inline">{tool.url}</span>
              </div>

              {/* Viewport Mode Selectors */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewportMode('desktop')}
                  className={`p-2 rounded-lg text-xs font-syne uppercase font-bold flex items-center gap-1.5 transition-all ${
                    viewportMode === 'desktop'
                      ? 'bg-accent text-black'
                      : 'bg-black2 text-white3 hover:text-white'
                  }`}
                  title="Desktop View (100%)"
                >
                  <Monitor size={14} /> Desktop
                </button>
                <button
                  onClick={() => setViewportMode('tablet')}
                  className={`p-2 rounded-lg text-xs font-syne uppercase font-bold flex items-center gap-1.5 transition-all ${
                    viewportMode === 'tablet'
                      ? 'bg-accent text-black'
                      : 'bg-black2 text-white3 hover:text-white'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet size={14} /> Tablet
                </button>
                <button
                  onClick={() => setViewportMode('mobile')}
                  className={`p-2 rounded-lg text-xs font-syne uppercase font-bold flex items-center gap-1.5 transition-all ${
                    viewportMode === 'mobile'
                      ? 'bg-accent text-black'
                      : 'bg-black2 text-white3 hover:text-white'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone size={14} /> Mobile
                </button>

                <button
                  onClick={() => setIframeKey(prev => prev + 1)}
                  className="p-2 bg-black2 text-white3 hover:text-white rounded-lg transition-colors"
                  title="Reload frame"
                >
                  <RefreshCw size={14} />
                </button>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-black2 text-accent hover:underline rounded-lg transition-colors flex items-center gap-1 text-xs font-syne uppercase font-bold"
                >
                  <ExternalLink size={14} /> Open
                </a>
              </div>
            </div>

            {/* Sandbox Notice Banner */}
            <div className="bg-black/50 px-6 py-2 border-b border-border/50 text-[11px] text-white3 flex items-center justify-between">
              <span>
                💡 Note: Interactive embed lets you test responsiveness directly. If a website restricts iframe framing (CSP header), click "Visit Website ↗" above.
              </span>
              <button
                onClick={() => setIsEmbedModalOpen(true)}
                className="text-accent hover:underline uppercase font-syne font-bold"
              >
                &lt;/&gt; Embed on your site
              </button>
            </div>

            {/* Viewport Frame Container */}
            <div className="bg-black4/60 p-4 md:p-8 flex justify-center items-center min-h-[680px]">
              <div
                className={`transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-border2 bg-white ${
                  viewportMode === 'desktop'
                    ? 'w-full h-[650px]'
                    : viewportMode === 'tablet'
                    ? 'w-[768px] h-[650px]'
                    : 'w-[375px] h-[650px]'
                }`}
              >
                <iframe
                  key={iframeKey}
                  src={tool.url}
                  title={`${tool.name} Live Sandbox`}
                  className="w-full h-full border-none bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Alternatives */}
      {activeTab === 'alternatives' && (
        <section className="section !py-12 max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <div className="sec-label !text-xs text-accent">Smart Similarity Match</div>
            <h2 className="font-syne text-2xl md:text-3xl font-bold uppercase tracking-tight text-white">
              Best Alternatives to {tool.name}
            </h2>
            <p className="text-white3 text-sm mt-1">
              Looking for other options in the {tool.catLabel} category? Check out these top recommendations:
            </p>
          </div>

          <div className="tools-grid">
            {alternatives.map(alt => (
              <ToolCard key={alt.id} tool={alt} />
            ))}
          </div>
        </section>
      )}

      {/* Embed Widget Generator Modal */}
      <EmbedWidgetModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        tool={tool}
      />
    </div>
  );
}
