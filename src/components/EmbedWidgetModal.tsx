import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink, Smartphone, Monitor, Palette } from 'lucide-react';
import { Tool } from '../types';

interface EmbedWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool;
}

export default function EmbedWidgetModal({ isOpen, onClose, tool }: EmbedWidgetModalProps) {
  const [embedType, setEmbedType] = useState<'card' | 'badge' | 'full'>('card');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = window.location.origin;
  const toolUrl = `${currentOrigin}/tool/${tool.id}`;

  let embedCode = '';
  if (embedType === 'card') {
    embedCode = `<iframe
  src="${toolUrl}?embed=true&theme=${theme}"
  width="100%"
  height="320"
  style="border: 1px solid ${theme === 'dark' ? '#222' : '#e5e7eb'}; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
  title="${tool.name} on ToolScout"
  loading="lazy"
></iframe>`;
  } else if (embedType === 'badge') {
    embedCode = `<a href="${toolUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:8px; padding:8px 14px; background:${theme === 'dark' ? '#111' : '#f4f4f5'}; border:1px solid ${theme === 'dark' ? '#333' : '#d1d5db'}; border-radius:10px; color:${theme === 'dark' ? '#fff' : '#111'}; font-family:sans-serif; font-size:13px; text-decoration:none; font-weight:600;">
  <span>${tool.icon}</span>
  <span>Featured on <strong>ToolScout</strong></span>
  <span style="color:#c8ff00; background:#000; padding:2px 6px; border-radius:4px; font-size:11px;">★ ${tool.rating}</span>
</a>`;
  } else {
    embedCode = `<iframe
  src="${toolUrl}?embed=full&theme=${theme}"
  width="100%"
  height="600"
  style="border: none; border-radius: 16px;"
  title="${tool.name} Live Interactive"
  allow="clipboard-write"
></iframe>`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-black2 border border-border2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 md:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white3 hover:text-white p-2 rounded-lg bg-black3 border border-border transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <div className="sec-label !text-xs !mb-1 text-accent flex items-center gap-1.5">
            <Code size={14} /> Embed Generator
          </div>
          <h2 className="font-syne text-2xl md:text-3xl font-bold uppercase tracking-tight text-white">
            Embed {tool.name} On Your Website
          </h2>
          <p className="text-white3 text-sm mt-1">
            Easily embed an interactive live card, badge, or widget for <strong>{tool.name}</strong> on your blog, Notion, documentation, or portfolio!
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-2">
              Widget Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEmbedType('card')}
                className={`py-2 px-3 text-xs font-syne font-bold uppercase rounded-lg border transition-all ${
                  embedType === 'card'
                    ? 'bg-accent text-black border-accent'
                    : 'bg-black3 text-white2 border-border hover:text-white'
                }`}
              >
                Interactive Card
              </button>
              <button
                type="button"
                onClick={() => setEmbedType('badge')}
                className={`py-2 px-3 text-xs font-syne font-bold uppercase rounded-lg border transition-all ${
                  embedType === 'badge'
                    ? 'bg-accent text-black border-accent'
                    : 'bg-black3 text-white2 border-border hover:text-white'
                }`}
              >
                Compact Badge
              </button>
              <button
                type="button"
                onClick={() => setEmbedType('full')}
                className={`py-2 px-3 text-xs font-syne font-bold uppercase rounded-lg border transition-all ${
                  embedType === 'full'
                    ? 'bg-accent text-black border-accent'
                    : 'bg-black3 text-white2 border-border hover:text-white'
                }`}
              >
                Full Interactive
              </button>
            </div>
          </div>

          <div>
            <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 text-xs font-syne font-bold uppercase rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'bg-accent text-black border-accent'
                    : 'bg-black3 text-white2 border-border hover:text-white'
                }`}
              >
                Dark (Cyber)
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 text-xs font-syne font-bold uppercase rounded-lg border transition-all ${
                  theme === 'light'
                    ? 'bg-accent text-black border-accent'
                    : 'bg-black3 text-white2 border-border hover:text-white'
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="mb-6">
          <label className="block font-syne text-xs font-bold uppercase tracking-wider text-white2 mb-2">
            Live Preview
          </label>
          <div
            className={`p-6 rounded-xl border flex items-center justify-center min-h-[160px] transition-all ${
              theme === 'dark'
                ? 'bg-black3 border-border'
                : 'bg-white border-gray-300 text-black'
            }`}
          >
            {embedType === 'badge' ? (
              <div
                className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-black2 border-border2 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                }`}
              >
                <span className="text-xl">{tool.icon}</span>
                <div className="text-xs font-syne">
                  <div>Featured on <strong>ToolScout</strong></div>
                  <div className="text-[11px] text-white3">{tool.name}</div>
                </div>
                <span className="bg-accent text-black text-[11px] font-bold px-2 py-0.5 rounded font-mono">
                  ★ {tool.rating}
                </span>
              </div>
            ) : (
              <div
                className={`w-full max-w-sm p-4 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-black2 border-border2 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tool.icon}</span>
                    <div>
                      <div className="font-syne font-bold text-sm">{tool.name}</div>
                      <div className="text-xs text-white3">{tool.catLabel}</div>
                    </div>
                  </div>
                  <span className="bg-accent/20 text-accent text-xs px-2 py-0.5 rounded font-mono">
                    {tool.price}
                  </span>
                </div>
                <p className="text-xs line-clamp-2 my-2 text-white2">{tool.desc}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
                  <span className="text-white3">⭐ {tool.rating} ({tool.ratingCount})</span>
                  <span className="text-accent font-bold">toolscout.io ↗</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="font-syne text-xs font-bold uppercase tracking-wider text-white2">
              HTML / Iframe Embed Code
            </label>
            <button
              onClick={handleCopy}
              className="text-xs text-accent hover:underline flex items-center gap-1 font-mono cursor-pointer"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied to Clipboard!' : 'Copy Code'}
            </button>
          </div>
          <pre className="bg-black4 border border-border2 text-accent p-4 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap selection:bg-accent selection:text-black">
            {embedCode}
          </pre>
        </div>

        {/* Instructions */}
        <div className="bg-black3 border border-border rounded-xl p-4 text-xs text-white3 space-y-1">
          <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">
            How to use:
          </div>
          <p>1. Copy the code snippet above.</p>
          <p>2. Paste it into your WordPress, Ghost, Notion (via Embed block), React, or HTML site.</p>
          <p>3. The widget updates in real time with the latest reviews and ratings.</p>
        </div>
      </div>
    </div>
  );
}
