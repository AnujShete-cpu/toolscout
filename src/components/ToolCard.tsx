import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Tool } from '../types';
import { cn } from '../lib/utils';
import React, { useState, useEffect } from 'react';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('toolscout_bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(tool.id));
  }, [tool.id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const bookmarks = JSON.parse(localStorage.getItem('toolscout_bookmarks') || '[]');
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id: number) => id !== tool.id);
    } else {
      newBookmarks = [...bookmarks, tool.id];
    }
    localStorage.setItem('toolscout_bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);

    const event = new CustomEvent('show-toast', {
      detail: isBookmarked ? 'Removed from bookmarks' : 'Bookmarked!'
    });
    window.dispatchEvent(event);
  };

  const num = (tool.id < 10 ? '0' : '') + tool.id;

  return (
    <div
      className={cn("tool-card cursor-pointer", tool.featured && "featured")}
      onClick={() => navigate(`/tool/${tool.id}`)}
    >
      <div className="tool-card-num">{num}</div>
      <div className="tool-top">
        <div className="tool-icon-wrap">{tool.icon}</div>
        <div className="tool-badges">
          {tool.badges.map((badge, i) => (
            <span
              key={i}
              className={cn(
                "badge",
                badge.type === 'feat' && "badge-feat",
                badge.type === 'free' && "badge-free",
                badge.type === 'new' && "badge-new",
                badge.type === 'paid' && "badge-paid"
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="tool-name">{tool.name}</div>
        <div className="tool-cat">{tool.catLabel}</div>
      </div>
      <p className="tool-desc">{tool.desc}</p>
      <div className="tool-tags">
        {tool.tags.map((tag, i) => (
          <span
            key={i}
            className="tool-tag"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/browse?q=${encodeURIComponent(tag)}`);
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="tool-footer">
        <div>
          <div className={cn("tool-price", tool.priceClass)}>{tool.price}</div>
          <div className="tool-rating">
            <span className="stars">{tool.stars}</span> {tool.rating} ({tool.ratingCount})
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={cn("bookmark-btn", isBookmarked && "saved")}
            onClick={toggleBookmark}
          >
            <Heart size={14} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          <button
            className="tool-link"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tool/${tool.id}`);
            }}
          >
            Try →
          </button>
        </div>
      </div>
    </div>
  );
};
