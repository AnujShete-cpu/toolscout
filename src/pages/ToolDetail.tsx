import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TOOLS } from '../constants';
import { Tool, Review } from '../types';
import { Heart } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ToolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const revealRefs = useRef<HTMLElement[]>([]);

  const loadReviews = (toolId: number) => {
    const all = JSON.parse(localStorage.getItem('toolscout_tool_reviews') || '[]');
    const toolReviews = all.filter((r: Review) => r.toolId === toolId);
    toolReviews.sort((a: Review, b: Review) => b.rating - a.rating);
    setReviews(toolReviews);
  };

  useEffect(() => {
    if (!id) return;
    const found = TOOLS.find(t => t.id === parseInt(id));
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
  }, [tool]);

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

  return (
    <div className="page active">
      <section className="tool-detail-hero">
        <button className="tool-detail-back reveal" onClick={() => navigate('/browse')} ref={addToReveal}>
          <span className="text-xl">←</span> Back to tools
        </button>

        <div className="flex items-center gap-6 mb-6">
          <div className="tool-icon-wrap !w-20 !h-20 !text-4xl">{tool.icon}</div>
          <div>
            <h1 className="hero-headline reveal !mb-2 !text-[clamp(32px,5vw,64px)]" ref={addToReveal}>{tool.name}</h1>
            <div className="tool-cat !text-sm">{tool.catLabel}</div>
          </div>
        </div>

        <div className="tool-badges reveal !justify-start mb-8" ref={addToReveal}>
          <span className="badge bg-white/10 text-xs py-1.5 px-3">{tool.price}</span>
          <span className="badge bg-white/10 text-xs py-1.5 px-3">
            <span className="stars">{tool.stars}</span> {tool.rating} ({tool.ratingCount})
          </span>
        </div>

        <p className="hero-sub reveal !max-w-[600px] !text-lg" ref={addToReveal}>{tool.desc}</p>

        <div className="tool-tags reveal mb-10" ref={addToReveal}>
          {tool.tags.map(tag => (
            <span
              key={tag}
              className="tool-tag !text-xs !py-1.5 !px-3"
              onClick={() => navigate(`/browse?q=${encodeURIComponent(tag)}`)}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="hero-actions reveal" ref={addToReveal}>
          <a href={tool.url} className="btn-primary" target="_blank" rel="noopener noreferrer">Visit Site ↗</a>
          <button
            className={cn("bookmark-btn !w-[54px] !h-[54px] !text-xl", isBookmarked && "saved")}
            onClick={toggleBookmark}
          >
            <Heart size={20} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </section>

      <section className="section border-t border-border">
        <div className="section-row reveal" ref={addToReveal}>
          <div className="section-title-block">
            <div className="sec-label">User Reviews</div>
            <h2 className="sec-title">What people<br /><em>think</em></h2>
          </div>
        </div>

        <div className="testimonials-grid reveal mb-10" ref={addToReveal}>
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
            <div className="p-6 text-white3">No reviews yet. Be the first to review!</div>
          )}
        </div>

        <div className="review-form reveal" ref={addToReveal}>
          <h3>Leave a Review</h3>
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
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <textarea
            placeholder="Your Review..."
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <button className="btn-primary w-full justify-center" onClick={submitReview}>
            Submit Review
          </button>
        </div>
      </section>
    </div>
  );
}
