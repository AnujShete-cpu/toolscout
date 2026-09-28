import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllTools } from '../lib/toolStore';
import { Tool } from '../types';
import { Plus, X, Sparkles, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';

export default function Compare() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [searchDropdown, setSearchDropdown] = useState('');
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const tools = getAllTools();
    setAllTools(tools);

    if (!isInitialized.current) {
      isInitialized.current = true;
      const idsParam = searchParams.get('tools');
      if (idsParam !== null) {
        if (idsParam.trim() === '') {
          setSelectedTools([]);
        } else {
          const ids = idsParam.split(',').map(id => parseInt(id)).filter(Boolean);
          const matched = ids.map(id => tools.find(t => t.id === id)).filter(Boolean) as Tool[];
          setSelectedTools(matched.slice(0, 4));
        }
      } else {
        // Only load initial defaults on first cold load with no 'tools' query parameter
        const defaults = [
          tools.find(t => t.name.toLowerCase().includes('cursor')) || tools[0],
          tools.find(t => t.name.toLowerCase().includes('claude')) || tools[1],
          tools.find(t => t.name.toLowerCase().includes('chatgpt')) || tools[2],
        ].filter(Boolean) as Tool[];
        setSelectedTools(defaults);
      }
    }
  }, [searchParams]);

  const updateUrl = (current: Tool[]) => {
    const ids = current.map(t => t.id).join(',');
    setSearchParams({ tools: ids }, { replace: true });
  };

  const handleAddTool = (tool: Tool) => {
    if (selectedTools.find(t => t.id === tool.id)) return;
    if (selectedTools.length >= 4) {
      alert('You can compare up to 4 tools simultaneously.');
      return;
    }
    const updated = [...selectedTools, tool];
    setSelectedTools(updated);
    updateUrl(updated);
    setActiveSlot(null);
    setSearchDropdown('');
  };

  const handleRemoveTool = (id: number) => {
    const updated = selectedTools.filter(t => t.id !== id);
    setSelectedTools(updated);
    updateUrl(updated);
  };

  const handleClearAll = () => {
    setSelectedTools([]);
    updateUrl([]);
  };

  const handleResetDefaults = () => {
    const defaults = [
      allTools.find(t => t.name.toLowerCase().includes('cursor')) || allTools[0],
      allTools.find(t => t.name.toLowerCase().includes('claude')) || allTools[1],
      allTools.find(t => t.name.toLowerCase().includes('chatgpt')) || allTools[2],
    ].filter(Boolean) as Tool[];
    setSelectedTools(defaults);
    updateUrl(defaults);
  };

  const filteredSearchTools = allTools.filter(t => {
    if (selectedTools.find(st => st.id === t.id)) return false;
    const q = searchDropdown.toLowerCase().trim();
    return !q || t.name.toLowerCase().includes(q) || t.catLabel.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q));
  });

  return (
    <div className="page active min-h-screen pt-[90px] pb-20 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <div className="sec-label !text-xs !mb-2 text-accent flex items-center justify-center gap-1.5">
          <Sparkles size={14} /> AI Decision Matrix
        </div>
        <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
          Compare <em className="text-accent not-italic">AI Tools</em> Side-by-Side
        </h1>
        <p className="text-white3 text-sm mt-3">
          Analyze pricing, features, capabilities, and ratings to pick the perfect tool for your workflow.
        </p>

        {/* Toolbar */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {selectedTools.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-black3 hover:bg-black4 border border-border hover:border-accent2 text-white3 hover:text-accent2 text-xs font-syne uppercase font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} /> Clear All ({selectedTools.length})
            </button>
          )}
          <button
            onClick={handleResetDefaults}
            className="bg-black3 hover:bg-black4 border border-border hover:border-white2 text-white2 hover:text-white text-xs font-syne uppercase font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} /> Reset Suggested
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="bg-black2 border border-border rounded-2xl overflow-hidden shadow-2xl p-4 md:p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(slotIndex => {
            const tool = selectedTools[slotIndex];
            return (
              <div
                key={slotIndex}
                className="bg-black3 border border-border2 rounded-xl p-5 flex flex-col justify-between relative min-h-[400px] transition-all"
              >
                {tool ? (
                  <>
                    <button
                      onClick={() => handleRemoveTool(tool.id)}
                      className="absolute top-3 right-3 text-white3 hover:text-accent2 p-1.5 bg-black2 rounded-lg border border-border transition-colors cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X size={14} />
                    </button>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pr-6">
                        <div className="w-12 h-12 rounded-xl bg-black2 border border-border flex items-center justify-center text-2xl flex-shrink-0">
                          {tool.icon}
                        </div>
                        <div>
                          <h3 className="font-syne font-bold text-base text-white">{tool.name}</h3>
                          <span className="text-xs text-white3">{tool.catLabel}</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex justify-between text-xs">
                          <span className="text-white3">Pricing</span>
                          <span className="font-mono text-accent font-bold">{tool.price}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white3">User Rating</span>
                          <span className="text-[#f0c040]">★ {tool.rating} ({tool.ratingCount})</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white3">Category</span>
                          <span className="text-white2">{tool.catLabel}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <span className="text-[11px] text-white3 font-syne uppercase tracking-wider block mb-1">
                          Overview
                        </span>
                        <p className="text-xs text-white2 line-clamp-3 leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {tool.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] bg-black2 border border-border text-white3 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 mt-auto">
                      <button
                        onClick={() => navigate(`/tool/${tool.id}`)}
                        className="flex-1 bg-black2 hover:bg-black4 border border-border text-white font-syne text-[11px] font-bold uppercase py-2.5 rounded-lg transition-colors text-center"
                      >
                        Details
                      </button>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-accent text-black font-syne text-[11px] font-bold uppercase py-2.5 rounded-lg hover:opacity-90 transition-all text-center flex items-center justify-center gap-1"
                      >
                        Visit ↗
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-border rounded-xl">
                    <button
                      onClick={() => setActiveSlot(slotIndex)}
                      className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 text-accent flex items-center justify-center mb-3 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Plus size={20} />
                    </button>
                    <div className="font-syne text-xs font-bold uppercase text-white">Add Tool to Compare</div>
                    <div className="text-[11px] text-white3 mt-1">Select from {allTools.length} catalog tools</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Select Tool Modal */}
      {activeSlot !== null && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-black2 border border-border2 w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col">
            <div className="p-4 bg-black3 border-b border-border flex items-center justify-between">
              <div className="font-syne font-bold text-sm text-white uppercase tracking-wider">
                Select Tool to Compare
              </div>
              <button onClick={() => setActiveSlot(null)} className="text-white3 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-border">
              <input
                type="text"
                autoFocus
                placeholder="Search tools by name or category..."
                value={searchDropdown}
                onChange={(e) => setSearchDropdown(e.target.value)}
                className="w-full bg-black3 border border-border2 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-accent"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSearchTools.length > 0 ? (
                filteredSearchTools.map(tool => (
                  <div
                    key={tool.id}
                    onClick={() => handleAddTool(tool)}
                    className="bg-black3 hover:bg-black4 border border-border hover:border-accent/40 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div>
                        <div className="font-syne font-bold text-xs text-white">{tool.name}</div>
                        <div className="text-[11px] text-white3">{tool.catLabel} · {tool.price}</div>
                      </div>
                    </div>
                    <Plus size={16} className="text-accent" />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-white3 text-xs italic">
                  No tools found matching "{searchDropdown}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
