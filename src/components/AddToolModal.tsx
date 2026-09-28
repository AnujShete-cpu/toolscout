import React, { useState } from 'react';
import { X, Sparkles, Plus, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { TOOL_CATEGORIES, addTool, extractToolMetaFromUrl } from '../lib/toolStore';
import { BadgeType } from '../types';
import { useNavigate } from 'react-router-dom';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newToolId: number) => void;
}

export default function AddToolModal({ isOpen, onClose, onSuccess }: AddToolModalProps) {
  const navigate = useNavigate();
  const [urlInput, setUrlInput] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('productivity');
  const [icon, setIcon] = useState('⚡');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('Freemium');
  const [rating, setRating] = useState(4.8);
  const [ratingCount, setRatingCount] = useState('500+');
  const [tagsInput, setTagsInput] = useState('ai, productivity');
  const [featured, setFeatured] = useState(false);
  const [badgeType, setBadgeType] = useState<BadgeType>('new');
  const [badgeLabel, setBadgeLabel] = useState('New');
  
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillSuccess, setAutoFillSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAiAutoFill = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Please enter a website URL to auto-fill');
      return;
    }
    setErrorMsg('');
    setIsAutoFilling(true);

    setTimeout(() => {
      try {
        const meta = extractToolMetaFromUrl(urlInput);
        if (meta.name) setName(meta.name);
        if (meta.cat) setCategory(meta.cat);
        if (meta.icon) setIcon(meta.icon);
        if (meta.desc) setDesc(meta.desc);
        if (meta.tags) setTagsInput(meta.tags.join(', '));
        if (meta.price) setPrice(meta.price);
        setAutoFillSuccess(true);
        setTimeout(() => setAutoFillSuccess(false), 3000);
      } catch (err: any) {
        setErrorMsg('Could not parse URL. Please fill fields manually.');
      } finally {
        setIsAutoFilling(false);
      }
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Tool name is required');
      return;
    }
    if (!urlInput.trim()) {
      setErrorMsg('Website URL is required');
      return;
    }
    if (!desc.trim()) {
      setErrorMsg('Description is required');
      return;
    }

    const catObj = TOOL_CATEGORIES.find(c => c.value === category) || { label: 'Productivity' };
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    let cleanUrl = urlInput.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const newTool = addTool({
      name: name.trim(),
      url: cleanUrl,
      cat: category,
      catLabel: catObj.label,
      icon: icon || '🤖',
      desc: desc.trim(),
      tags: parsedTags.length > 0 ? parsedTags : ['ai', category],
      badges: [{ type: badgeType, label: badgeLabel.trim() || 'New' }],
      price: price,
      priceClass: price.toLowerCase().includes('free') ? 'free' : price.toLowerCase().includes('freemium') ? 'freemium' : '',
      rating: Number(rating) || 4.8,
      ratingCount: ratingCount.trim() || '100+',
      stars: '★★★★★',
      featured: featured,
      match: `${name.toLowerCase()} ${category} ${parsedTags.join(' ')} ${desc.toLowerCase()}`,
    });

    const event = new CustomEvent('show-toast', {
      detail: `"${newTool.name}" added to catalog successfully!`
    });
    window.dispatchEvent(event);

    onClose();
    if (onSuccess) {
      onSuccess(newTool.id);
    } else {
      navigate(`/tool/${newTool.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-black2 border border-border2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 md:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white3 hover:text-white p-2 rounded-lg bg-black3 border border-border transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="sec-label !text-xs !mb-1 text-accent">Dynamic Catalog</div>
          <h2 className="font-syne text-2xl md:text-3xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
            Add New AI Tool / Website
          </h2>
          <p className="text-white3 text-sm mt-1">
            Add any AI website or tool instantly. It will appear across the directory without modifying any code!
          </p>
        </div>

        {/* AI Quick AutoFill Banner */}
        <div className="bg-gradient-to-r from-accent/15 via-black3 to-black3 border border-accent/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-accent font-syne text-xs uppercase font-bold tracking-wider">
              <Sparkles size={16} /> ⚡ AI Instant Auto-Fill
            </div>
            {autoFillSuccess && (
              <span className="text-accent text-xs font-mono flex items-center gap-1">
                <Check size={14} /> Auto-filled!
              </span>
            )}
          </div>
          <p className="text-white2 text-xs mb-3">
            Paste any website URL (e.g. <span className="font-mono text-white">cursor.com</span> or <span className="font-mono text-white">v0.dev</span>) and AI will automatically infer the name, category, description, and tags for you!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-black4 border border-border2 text-white text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={handleAiAutoFill}
              disabled={isAutoFilling}
              className="bg-accent text-black font-syne text-xs font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 whitespace-nowrap uppercase tracking-wider"
            >
              <Sparkles size={14} />
              {isAutoFilling ? 'Analyzing...' : 'Auto-Fill with AI'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-accent2/15 border border-accent2/40 text-accent2 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-1.5">
                Tool / Website Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cursor, Midjourney"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black3 border border-border2 text-white text-sm px-3.5 py-2.5 rounded-lg outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-1.5">
                Icon Emoji
              </label>
              <input
                type="text"
                maxLength={4}
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-black3 border border-border2 text-white text-center text-lg py-2 rounded-lg outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black3 border border-border2 text-white text-sm px-3 py-2.5 rounded-lg outline-none focus:border-accent"
              >
                {TOOL_CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-1.5">
                Pricing Model
              </label>
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-black3 border border-border2 text-white text-sm px-3 py-2.5 rounded-lg outline-none focus:border-accent"
              >
                <option value="Free">Free</option>
                <option value="Freemium">Freemium</option>
                <option value="Paid">Paid</option>
                <option value="Free Trial">Free Trial</option>
                <option value="Open Source">Open Source</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={2}
              placeholder="What does this AI tool do? What makes it unique?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-black3 border border-border2 text-white text-sm px-3.5 py-2.5 rounded-lg outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="coding, assistant, productivity, vscode"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-black3 border border-border2 text-white text-xs px-3.5 py-2.5 rounded-lg outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-1.5">
                Badge Type
              </label>
              <select
                value={badgeType}
                onChange={(e) => setBadgeType(e.target.value as BadgeType)}
                className="w-full bg-black3 border border-border2 text-white text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent"
              >
                <option value="new">New (Yellow)</option>
                <option value="feat">Featured (Cyan)</option>
                <option value="free">Free/Freemium (Green)</option>
                <option value="paid">Paid (Orange)</option>
              </select>
            </div>

            <div>
              <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-1.5">
                Badge Label
              </label>
              <input
                type="text"
                value={badgeLabel}
                onChange={(e) => setBadgeLabel(e.target.value)}
                placeholder="e.g. New, Popular"
                className="w-full bg-black3 border border-border2 text-white text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-1.5">
                Rating
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full bg-black3 border border-border2 text-white text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured-tool-checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-accent w-4 h-4 cursor-pointer"
            />
            <label htmlFor="featured-tool-checkbox" className="text-white text-xs cursor-pointer select-none">
              Feature this tool on Homepage Hero & Featured Showcase
            </label>
          </div>

          {/* Live Mini Preview */}
          <div className="bg-black4 border border-border rounded-xl p-4 mt-4">
            <div className="text-[11px] font-syne text-white3 uppercase tracking-wider mb-2 font-bold">
              Live Card Preview:
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black2 border border-border flex items-center justify-center text-xl">
                  {icon || '🤖'}
                </div>
                <div>
                  <div className="font-syne font-bold text-sm text-white">{name || 'Tool Name'}</div>
                  <div className="text-xs text-white3">{TOOL_CATEGORIES.find(c => c.value === category)?.label || 'Category'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-white/10 text-[11px] py-1 px-2">{price}</span>
                <span className="badge bg-white/10 text-[11px] py-1 px-2 text-[#f0c040]">★ {rating}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-border2 text-white2 font-syne text-xs uppercase font-bold hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-accent text-black px-6 py-2.5 rounded-lg font-syne text-xs uppercase font-bold tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-accent/10"
            >
              <Plus size={16} /> Save & Publish Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
