import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllTools, TOOL_CATEGORIES } from '../lib/toolStore';
import { Tool } from '../types';
import { Plus, X, Sparkles, ExternalLink, RefreshCw, Trash2, Trophy, Award, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

interface AIAnalysisResult {
  winnerId: number;
  winnerReason: string;
  bestValueId: number | null;
  valueReason: string;
  scores: Record<number, { overall: number; ratingScore: number; valueScore: number; featureScore: number; bestFor: string }>;
  summary: string;
}

export default function Compare() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('coding');
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [searchDropdown, setSearchDropdown] = useState('');
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  
  // AI Comparison Run State
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  const isInitialized = useRef(false);

  useEffect(() => {
    const tools = getAllTools();
    setAllTools(tools);

    if (!isInitialized.current) {
      isInitialized.current = true;
      const catParam = searchParams.get('cat') || 'coding';
      setSelectedCat(catParam);

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
        // Initial defaults for the selected category
        const catTools = tools.filter(t => t.cat === catParam);
        setSelectedTools(catTools.slice(0, 3));
      }
    }
  }, [searchParams]);

  const updateUrl = (current: Tool[], cat: string) => {
    const ids = current.map(t => t.id).join(',');
    setSearchParams({ cat, tools: ids }, { replace: true });
  };

  const handleCategoryChange = (newCat: string) => {
    setSelectedCat(newCat);
    setAnalysisResult(null);
    const catTools = allTools.filter(t => t.cat === newCat);
    const initialForCat = catTools.slice(0, 3);
    setSelectedTools(initialForCat);
    updateUrl(initialForCat, newCat);
  };

  const handleAddTool = (tool: Tool) => {
    if (selectedTools.find(t => t.id === tool.id)) return;
    if (selectedTools.length >= 4) {
      alert('You can compare up to 4 tools simultaneously.');
      return;
    }
    const updated = [...selectedTools, tool];
    setSelectedTools(updated);
    setAnalysisResult(null);
    updateUrl(updated, selectedCat);
    setActiveSlot(null);
    setSearchDropdown('');
  };

  const handleRemoveTool = (id: number) => {
    const updated = selectedTools.filter(t => t.id !== id);
    setSelectedTools(updated);
    setAnalysisResult(null);
    updateUrl(updated, selectedCat);
  };

  const handleClearAll = () => {
    setSelectedTools([]);
    setAnalysisResult(null);
    updateUrl([], selectedCat);
  };

  const handleResetDefaults = () => {
    const catTools = allTools.filter(t => t.cat === selectedCat);
    const defaults = catTools.slice(0, 3);
    setSelectedTools(defaults);
    setAnalysisResult(null);
    updateUrl(defaults, selectedCat);
  };

  // Run AI Comparison Algorithm
  const handleRunAIComparison = () => {
    if (selectedTools.length < 2) {
      alert('Please add at least 2 tools from the same category to run an AI comparison.');
      return;
    }

    setIsRunningAI(true);
    setAnalysisResult(null);

    setTimeout(() => {
      // Basic AI Scoring Algorithm:
      // 1. Rating Score: (rating / 5) * 40
      // 2. Value Score: Free = 30, Freemium = 25, Paid = 15
      // 3. Capability / Feature Score: tags length + desc relevance = up to 30
      const scores: Record<number, { overall: number; ratingScore: number; valueScore: number; featureScore: number; bestFor: string }> = {};

      let highestOverall = -1;
      let winnerTool = selectedTools[0];
      let bestValueTool: Tool | null = null;
      let highestValueScore = -1;

      selectedTools.forEach(tool => {
        const ratingScore = Math.round(((tool.rating || 4.5) / 5) * 40);
        
        let valueScore = 18;
        const priceLower = tool.price.toLowerCase();
        if (priceLower.includes('free') && !priceLower.includes('trial') && !priceLower.includes('freemium')) {
          valueScore = 30;
        } else if (priceLower.includes('freemium') || priceLower.includes('free trial')) {
          valueScore = 26;
        } else {
          valueScore = 18;
        }

        const featureScore = Math.min(30, 15 + (tool.tags.length * 3) + (tool.featured ? 5 : 0));
        const overall = ratingScore + valueScore + featureScore;

        let bestFor = 'General workflow & production';
        if (valueScore === 30) {
          bestFor = 'Budget-friendly & open exploration';
        } else if (tool.rating >= 4.9) {
          bestFor = 'Top-tier performance & reliability';
        } else if (tool.desc.toLowerCase().includes('agent') || tool.desc.toLowerCase().includes('auto')) {
          bestFor = 'Autonomous automation';
        } else {
          bestFor = 'Fast everyday productivity';
        }

        scores[tool.id] = { overall, ratingScore, valueScore, featureScore, bestFor };

        if (overall > highestOverall) {
          highestOverall = overall;
          winnerTool = tool;
        }

        if (valueScore > highestValueScore) {
          highestValueScore = valueScore;
          bestValueTool = tool;
        }
      });

      const bestVal = bestValueTool as Tool | null;
      const isDistinctValue = bestVal && bestVal.id !== winnerTool.id;

      const result: AIAnalysisResult = {
        winnerId: winnerTool.id,
        winnerReason: `${winnerTool.name} delivers the strongest balance in the ${winnerTool.catLabel} category with a stellar ${winnerTool.rating}/5.0 rating and rich capabilities.`,
        bestValueId: isDistinctValue ? bestVal.id : null,
        valueReason: isDistinctValue ? `${bestVal.name} offers the best price-to-performance tier (${bestVal.price}).` : '',
        scores,
        summary: `Comparing ${selectedTools.length} ${winnerTool.catLabel} tools: While ${winnerTool.name} leads overall, choose based on your pricing budget and specific workflow depth.`,
      };

      setAnalysisResult(result);
      setIsRunningAI(false);

      // Scroll smoothly to results
      const resEl = document.getElementById('ai-comparison-results');
      if (resEl) {
        resEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 700);
  };

  // Only tools in the selected category can be added to compare
  const availableCategoryTools = allTools.filter(t => t.cat === selectedCat);
  const filteredSearchTools = availableCategoryTools.filter(t => {
    if (selectedTools.find(st => st.id === t.id)) return false;
    const q = searchDropdown.toLowerCase().trim();
    return !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q));
  });

  return (
    <div className="page active min-h-screen pt-[90px] pb-20 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="mb-6 text-center max-w-3xl mx-auto">
        <div className="sec-label !text-xs !mb-2 text-accent flex items-center justify-center gap-1.5">
          <Sparkles size={14} /> AI Decision Matrix
        </div>
        <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
          Compare <em className="text-accent not-italic">AI Tools</em> Side-by-Side
        </h1>
        <p className="text-white3 text-sm mt-3">
          Select a category to compare tools logically within the same domain, then run our AI algorithm to find the best pick.
        </p>
      </div>

      {/* Category Filter Bar (Strict Single-Category Comparison) */}
      <div className="mb-8">
        <div className="text-center font-syne text-xs uppercase font-bold text-white3 tracking-wider mb-3">
          Step 1: Choose Category To Compare
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {TOOL_CATEGORIES.filter(c => c.value !== 'all').map(cat => {
            const count = allTools.filter(t => t.cat === cat.value).length;
            if (count === 0) return null;
            const isSelected = selectedCat === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`py-2 px-4 rounded-xl text-xs font-syne font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-accent text-black border-accent shadow-lg shadow-accent/20 scale-105'
                    : 'bg-black2 text-white2 border-border hover:border-white2 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-black text-accent' : 'bg-black3 text-white3'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 max-w-7xl mx-auto px-2">
        <div className="font-syne text-xs uppercase text-white font-bold flex items-center gap-2">
          <span>Comparing in:</span>
          <span className="text-accent bg-accent/10 border border-accent/30 px-2.5 py-1 rounded-lg">
            {TOOL_CATEGORIES.find(c => c.value === selectedCat)?.label || selectedCat}
          </span>
          <span className="text-white3 text-[11px]">({selectedTools.length}/4 tools selected)</span>
        </div>

        <div className="flex items-center gap-2">
          {selectedTools.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-black3 hover:bg-black4 border border-border hover:border-accent2 text-white3 hover:text-accent2 text-xs font-syne uppercase font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
          <button
            onClick={handleResetDefaults}
            className="bg-black3 hover:bg-black4 border border-border hover:border-white2 text-white2 hover:text-white text-xs font-syne uppercase font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="bg-black2 border border-border rounded-2xl overflow-hidden shadow-2xl p-4 md:p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(slotIndex => {
            const tool = selectedTools[slotIndex];
            const isWinner = analysisResult?.winnerId === tool?.id;
            const isBestValue = analysisResult?.bestValueId === tool?.id;

            return (
              <div
                key={slotIndex}
                className={`bg-black3 rounded-xl p-5 flex flex-col justify-between relative min-h-[420px] transition-all border ${
                  isWinner
                    ? 'border-accent shadow-xl shadow-accent/15 ring-1 ring-accent'
                    : isBestValue
                    ? 'border-cyan-400 shadow-lg shadow-cyan-400/10'
                    : 'border-border2 hover:border-border'
                }`}
              >
                {tool ? (
                  <>
                    {/* Winner / Value Badges */}
                    {isWinner && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black font-syne text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap z-10">
                        <Trophy size={11} /> 👑 AI Top Choice
                      </div>
                    )}
                    {isBestValue && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-black font-syne text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap z-10">
                        <Award size={11} /> 💎 Best Value
                      </div>
                    )}

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

                      {/* AI Score if analyzed */}
                      {analysisResult?.scores[tool.id] && (
                        <div className="bg-black2 border border-border p-3 rounded-lg space-y-1.5 animate-fadeIn">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-white3">AI Match Score:</span>
                            <span className="font-mono font-bold text-accent">
                              {analysisResult.scores[tool.id].overall}/100
                            </span>
                          </div>
                          <div className="text-[10px] text-white2 italic">
                            🎯 Best for: {analysisResult.scores[tool.id].bestFor}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 mt-auto">
                      <button
                        onClick={() => navigate(`/tool/${tool.id}`)}
                        className="flex-1 bg-black2 hover:bg-black4 border border-border text-white font-syne text-[11px] font-bold uppercase py-2.5 rounded-lg transition-colors text-center cursor-pointer"
                      >
                        Details
                      </button>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-accent text-black font-syne text-[11px] font-bold uppercase py-2.5 rounded-lg hover:opacity-90 transition-all text-center flex items-center justify-center gap-1 cursor-pointer font-extrabold"
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
                    <div className="font-syne text-xs font-bold uppercase text-white">Add {selectedCat} Tool</div>
                    <div className="text-[11px] text-white3 mt-1">Select from {availableCategoryTools.length} tools</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prominent RUN AI COMPARISON Button (Placed right below comparison box as requested) */}
      <div className="flex flex-col items-center justify-center mb-12">
        <button
          onClick={handleRunAIComparison}
          disabled={isRunningAI || selectedTools.length < 2}
          className="bg-accent text-black font-syne text-sm uppercase font-extrabold px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
        >
          <Sparkles size={20} className={isRunningAI ? 'animate-spin' : ''} />
          <span>{isRunningAI ? 'Running AI Evaluation...' : '⚡ Run AI Comparison'}</span>
        </button>
        <span className="text-white3 text-xs mt-2.5">
          {selectedTools.length < 2
            ? 'Add at least 2 tools above to run the comparison algorithm'
            : `Evaluates ${selectedTools.length} ${TOOL_CATEGORIES.find(c => c.value === selectedCat)?.label || selectedCat} tools across rating, pricing value, and capability depth`}
        </span>
      </div>

      {/* AI Comparison Results Section */}
      {analysisResult && (
        <div id="ai-comparison-results" className="bg-black2 border border-accent/40 rounded-2xl p-6 md:p-8 shadow-2xl mb-12 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-accent font-syne text-xs uppercase font-extrabold tracking-wider mb-2">
            <Trophy size={16} /> AI Comparative Verdict
          </div>
          <h2 className="font-syne text-2xl md:text-3xl font-bold uppercase text-white mb-3">
            Winner: <span className="text-accent">{allTools.find(t => t.id === analysisResult.winnerId)?.name}</span>
          </h2>
          <p className="text-white2 text-sm leading-relaxed mb-6 max-w-3xl">
            {analysisResult.winnerReason}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="bg-black3 border border-border p-4 rounded-xl">
              <div className="text-xs font-syne font-bold uppercase text-accent mb-1 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Overall AI Recommendation
              </div>
              <p className="text-xs text-white2 leading-relaxed">
                {analysisResult.summary}
              </p>
            </div>

            {analysisResult.bestValueId && (
              <div className="bg-black3 border border-border p-4 rounded-xl">
                <div className="text-xs font-syne font-bold uppercase text-cyan-400 mb-1 flex items-center gap-1.5">
                  <Award size={14} /> Best Value / Budget Option
                </div>
                <p className="text-xs text-white2 leading-relaxed">
                  {analysisResult.valueReason}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Select Tool Modal (Filtered exclusively to active category) */}
      {activeSlot !== null && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-black2 border border-border2 w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col">
            <div className="p-4 bg-black3 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-syne font-bold text-sm text-white uppercase tracking-wider">
                  Select {TOOL_CATEGORIES.find(c => c.value === selectedCat)?.label} Tool
                </div>
                <div className="text-[11px] text-white3">
                  Only tools in "{selectedCat}" are shown for logical comparison
                </div>
              </div>
              <button onClick={() => setActiveSlot(null)} className="text-white3 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-border">
              <input
                type="text"
                autoFocus
                placeholder={`Search ${selectedCat} tools...`}
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
                <div className="p-6 text-center text-white3 text-xs italic">
                  No {selectedCat} tools found matching "{searchDropdown}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
