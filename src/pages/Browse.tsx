import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllTools, TOOL_CATEGORIES } from '../lib/toolStore';
import { ToolCard } from '../components/ToolCard';
import { Tool } from '../types';
import { cn } from '../lib/utils';
import { Plus, Search, Sparkles } from 'lucide-react';
import AddToolModal from '../components/AddToolModal';
import { isAdminAuthenticated } from '../lib/adminAuth';
import React from 'react';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tools, setTools] = useState<Tool[]>([]);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [catFilter, setCatFilter] = useState(searchParams.get('cat') || 'all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());

  const revealRefs = useRef<HTMLElement[]>([]);

  const loadTools = () => {
    setTools(getAllTools());
  };

  useEffect(() => {
    loadTools();
    const handleAdminChanged = (e: any) => setIsAdmin(Boolean(e.detail));
    window.addEventListener('toolscout_tools_updated', loadTools);
    window.addEventListener('toolscout_admin_changed', handleAdminChanged);
    return () => {
      window.removeEventListener('toolscout_tools_updated', loadTools);
      window.removeEventListener('toolscout_admin_changed', handleAdminChanged);
    };
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    const c = searchParams.get('cat');
    const f = searchParams.get('filter');
    if (q !== null) setQuery(q);
    if (c !== null) setCatFilter(c);
    if (f !== null) setFilter(f);
  }, [searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    revealRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [tools]);

  const addToReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const filteredTools = tools.filter(t => {
    const matchesFilter = filter === 'all' ? true : filter === 'featured' ? t.featured : true;
    const matchesCat = catFilter === 'all' ? true : t.cat === catFilter;
    const q = query.toLowerCase().trim();
    const matchesQuery = !q ? true : (
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.match.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q)) ||
      t.catLabel.toLowerCase().includes(q)
    );
    return matchesFilter && matchesCat && matchesQuery;
  });

  const categories = ['all', ...Array.from(new Set(tools.map(t => t.cat)))];

  return (
    <div className="page active">
      <div className="browse-header">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="section-title-block reveal" ref={addToReveal}>
            <div className="sec-label">AI Tools Directory ({tools.length} Tools)</div>
            <h1 className="sec-title">Browse<br /><em>all tools</em></h1>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-accent text-black font-syne text-xs uppercase font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-accent/10 self-start md:self-auto cursor-pointer"
            >
              <Plus size={16} /> + Add New Website / Tool
            </button>
          )}
        </div>

        <div className="browse-search-wrap reveal mt-8" ref={addToReveal}>
          <input
            type="text"
            placeholder="Search by name, category, feature or problem…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => {}}>Search</button>
        </div>

        <div className="tools-filters reveal" ref={addToReveal}>
          {categories.map(cat => {
            const foundCat = TOOL_CATEGORIES.find(c => c.value === cat);
            const label = foundCat ? foundCat.label : cat.charAt(0).toUpperCase() + cat.slice(1);
            return (
              <button
                key={String(cat)}
                className={cn("tfilter", catFilter === cat && "active")}
                onClick={() => setCatFilter(String(cat))}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="section !pt-[60px]">
        {filteredTools.length > 0 ? (
          <div className="tools-grid">
            {filteredTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-black2 border border-border rounded-2xl p-8 max-w-xl mx-auto">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-syne text-lg font-bold uppercase text-white mb-1">No tools found</h3>
            <p className="text-white3 text-xs mb-6">
              Couldn't find any tool matching "{query}". Would you like to add it to the directory?
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-accent text-black font-syne text-xs uppercase font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus size={15} /> + Add This Website Now
            </button>
          </div>
        )}
      </section>

      {/* Add Tool Modal */}
      <AddToolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          loadTools();
        }}
      />
    </div>
  );
}
