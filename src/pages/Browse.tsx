import { useState, useEffect, useRef, useLayoutEffect} from 'react';
import { useSearchParams } from 'react-router-dom';
import { TOOLS } from '../constants';
import { ToolCard } from '../components/ToolCard';
import { cn } from '../lib/utils';
import React from 'react';

export default function Browse() {
  const [searchParams] = useSearchParams();
  const [filter] = useState(searchParams.get('filter') || 'all');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [catFilter, setCatFilter] = useState(searchParams.get('cat') || 'all');

  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const q = searchParams.get('q');
    const c = searchParams.get('cat');
    if (q !== null) setQuery(q);
    if (c !== null) setCatFilter(c);
  }, [searchParams]);

  useLayoutEffect(() => {
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

  const filteredTools = TOOLS.filter(t => {
    const matchesFilter = filter === 'all' ? true : filter === 'featured' ? t.featured : true;
    const matchesCat = catFilter === 'all' ? true : t.cat === catFilter;
    const q = query.toLowerCase();
    const matchesQuery = !q ? true : (
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.match.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q)) ||
      t.catLabel.toLowerCase().includes(q)
    );
    return matchesFilter && matchesCat && matchesQuery;
  });

  const categories = ['all', ...new Set(TOOLS.map(t => t.cat))];
  const catLabels: Record<string, string> = {
    all: 'All', video: 'Video', image: 'Image', writing: 'Writing', audio: 'Audio',
    coding: 'Coding', generation: 'Generation', productivity: 'Productivity',
    marketing: 'Marketing', agent: 'Agent', chatbot: 'Chatbot', data: 'Data',
    document: 'Document', education: 'Education', finance: 'Finance', health: 'Health',
    hr: 'HR', meeting: 'Meeting', presentation: 'Presentation', support: 'Support',
    infrastructure: 'Infrastructure', 'no-code': 'No-Code', avatar: 'Avatar', browser: 'Browser',
  };

  return (
    <div className="page active">
      <div className="browse-header">
        <div className="section-title-block reveal" ref={addToReveal}>
          <div className="sec-label">AI Tools Directory</div>
          <h1 className="sec-title">Browse<br /><em>all tools</em></h1>
        </div>
        <div className="browse-search-wrap reveal mt-8" ref={addToReveal}>
          <input
            type="text"
            placeholder="Search by name, feature or problem…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => {}}>Search</button>
        </div>
        <div className="tools-filters reveal" ref={addToReveal}>
          {categories.map(cat => (
            <button
              key={String(cat)}
              className={cn("tfilter", catFilter === cat && "active")}
              onClick={() => setCatFilter(String(cat))}
            >
              {catLabels[String(cat)] || String(cat).charAt(0).toUpperCase() + String(cat).slice(1)}
            </button>
          ))}
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
          <div className="py-10 text-white3 italic">No tools found matching your search.</div>
        )}
      </section>
    </div>
  );
}
