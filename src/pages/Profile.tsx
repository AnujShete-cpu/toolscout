import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants';
import { ToolCard } from '../components/ToolCard';
import { Tool } from '../types';
import { Heart, Info } from 'lucide-react';

export default function Profile() {
  const [likedTools, setLikedTools] = useState<Tool[]>([]);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const loadBookmarks = () => {
      const bookmarks = JSON.parse(localStorage.getItem('toolscout_bookmarks') || '[]');
      setLikedTools(TOOLS.filter(t => bookmarks.includes(t.id)));
    };
    loadBookmarks();

    const handleToast = () => loadBookmarks();
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    revealRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [likedTools]);

  const addToReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const clearBookmarks = () => {
    localStorage.removeItem('toolscout_bookmarks');
    setLikedTools([]);
  };

  return (
    <div className="page active">
      <div className="ticker-wrap mt-[70px]">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="ticker-item"><span className="ticker-sep"></span>Your Profile</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Liked Tools</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Saved Resources</span>
              <span className="ticker-item"><span className="ticker-sep"></span>AI Discovery</span>
              <span className="ticker-item"><span className="ticker-sep"></span>Personal Toolkit</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <section className="section min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          <div className="section-row mb-12 reveal" ref={addToReveal}>
            <div className="section-title-block">
              <div className="sec-label">User Account</div>
              <h1 className="sec-title">Your<br /><em>Profile</em></h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12">
            {/* Sidebar */}
            <div className="flex flex-col gap-6 reveal" ref={addToReveal}>
              <div className="bg-black2 border border-border p-8 rounded-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-2xl">
                    🤖
                  </div>
                  <div>
                    <h2 className="font-syne text-xl font-bold uppercase tracking-tight">Explorer</h2>
                    <p className="text-white3 text-sm font-mono">toolscout user</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    to="/how-it-works"
                    className="flex items-center justify-between w-full p-4 bg-black3 hover:bg-black4 border border-border rounded-xl transition-all group no-underline text-white"
                  >
                    <div className="flex items-center gap-3">
                      <Info size={18} className="text-accent" />
                      <span className="font-syne text-[13px] font-bold uppercase tracking-wider">Learn More</span>
                    </div>
                    <span className="text-white3 group-hover:text-white transition-colors text-lg">›</span>
                  </Link>

                  {likedTools.length > 0 && (
                    <button
                      onClick={clearBookmarks}
                      className="flex items-center justify-between w-full p-4 bg-black3 hover:bg-black4 border border-border rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-accent2 text-lg">✕</span>
                        <span className="font-syne text-[13px] font-bold uppercase tracking-wider text-white">Clear Saved</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-accent/5 border border-accent/10 p-6 rounded-2xl">
                <h3 className="font-syne text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2">Stats</h3>
                <div className="flex items-center justify-between">
                  <span className="text-white2 text-sm italic">Saved Tools</span>
                  <span className="font-mono text-xl font-bold text-accent">{likedTools.length}</span>
                </div>
              </div>
            </div>

            {/* Main — Liked Tools */}
            <div className="reveal" ref={addToReveal}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-syne text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                  <Heart size={24} className="text-accent" fill="currentColor" />
                  Saved Tools
                </h2>
              </div>

              {likedTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {likedTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="bg-black2 border border-dashed border-border p-12 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white3">
                    <Heart size={32} />
                  </div>
                  <h3 className="font-syne text-lg font-bold uppercase mb-2">No saved tools yet</h3>
                  <p className="text-white3 text-sm italic mb-6">Start exploring and save your favorite AI tools here.</p>
                  <Link to="/browse" className="btn-primary">Browse Tools</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
