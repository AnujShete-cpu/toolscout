import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, ArrowRight, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { getAllTools } from '../lib/toolStore';
import { Tool } from '../types';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedTools?: Tool[];
  workflow?: {
    title: string;
    steps: { tool: Tool; action: string }[];
  };
  timestamp: string;
}

const QUICK_PROMPTS = [
  '⚡ Best AI tools for coding apps from scratch',
  '🎬 Turn blog posts into short videos',
  '🎙️ Clone my voice and generate podcasts',
  '🤖 Top autonomous AI agents for research',
  '💰 Best 100% Free AI tools available',
];

export default function ScoutAIAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hey! I'm **Scout AI**, your intelligent AI directory assistant. Tell me what task, workflow, or problem you want to solve, and I'll find the exact best tools and stacks for you.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const processAIQuery = (userText: string) => {
    const q = userText.toLowerCase().trim();
    const allTools = getAllTools();

    // Heuristic workflow detection
    if (q.includes('workflow') || q.includes('stack') || q.includes('pipeline') || (q.includes('video') && q.includes('audio')) || (q.includes('turn') && q.includes('into'))) {
      if (q.includes('video') || q.includes('youtube') || q.includes('tiktok')) {
        const scriptTool = allTools.find(t => t.name.toLowerCase().includes('chatgpt') || t.cat === 'writing') || allTools[0];
        const audioTool = allTools.find(t => t.name.toLowerCase().includes('elevenlabs') || t.cat === 'audio') || allTools[1];
        const videoTool = allTools.find(t => t.name.toLowerCase().includes('runway') || t.name.toLowerCase().includes('pika') || t.cat === 'video') || allTools[2];

        return {
          text: `Here is the optimal **End-to-End AI Video Creation Pipeline** for your project:`,
          workflow: {
            title: 'Viral AI Video Workflow',
            steps: [
              { tool: scriptTool, action: 'Draft hooks, viral script, and visual prompts' },
              { tool: audioTool, action: 'Generate ultra-realistic human voiceover & music' },
              { tool: videoTool, action: 'Generate b-roll clips & render final video' },
            ],
          },
          recommendedTools: [scriptTool, audioTool, videoTool],
        };
      } else if (q.includes('code') || q.includes('app') || q.includes('website') || q.includes('saas')) {
        const ideTool = allTools.find(t => t.name.toLowerCase().includes('cursor') || t.cat === 'coding') || allTools[0];
        const uiTool = allTools.find(t => t.name.toLowerCase().includes('v0') || t.name.toLowerCase().includes('lovable') || t.name.toLowerCase().includes('bolt')) || allTools[1];
        const hostTool = allTools.find(t => t.name.toLowerCase().includes('replit') || t.cat === 'infrastructure') || allTools[2];

        return {
          text: `Here is the highest-rated **Solo Founder AI App Building Stack**:`,
          workflow: {
            title: 'Modern AI Full-Stack Workflow',
            steps: [
              { tool: uiTool, action: 'Generate responsive UI components and frontend' },
              { tool: ideTool, action: 'Build business logic and orchestrate codebase' },
              { tool: hostTool, action: 'Deploy backend, APIs, and live production' },
            ],
          },
          recommendedTools: [uiTool, ideTool, hostTool],
        };
      }
    }

    // General Tool Matching
    const scoredTools = allTools.map(tool => {
      let score = 0;
      const terms = q.split(/\s+/).filter(t => t.length > 2);

      for (const term of terms) {
        if (tool.name.toLowerCase().includes(term)) score += 10;
        if (tool.desc.toLowerCase().includes(term)) score += 5;
        if (tool.match.toLowerCase().includes(term)) score += 4;
        if (tool.cat.toLowerCase().includes(term)) score += 6;
        if (tool.tags.some(tag => tag.toLowerCase().includes(term))) score += 5;
      }

      if (q.includes('free') && (tool.price.toLowerCase().includes('free') || tool.priceClass === 'free')) {
        score += 8;
      }
      if (tool.featured) score += 2;
      score += tool.rating;

      return { tool, score };
    });

    scoredTools.sort((a, b) => b.score - a.score);
    const topMatches = scoredTools.filter(item => item.score > 7).slice(0, 3).map(item => item.tool);

    if (topMatches.length === 0) {
      // Fallback to top featured or category
      const fallback = allTools.slice(0, 3);
      return {
        text: `I searched across our catalog of **${allTools.length}+ AI tools** for "${userText}". Here are the most versatile top-rated solutions that match your interest:`,
        recommendedTools: fallback,
      };
    }

    return {
      text: `Based on your request, I found **${topMatches.length} high-performing AI tools** tailored for this exact use case:`,
      recommendedTools: topMatches,
    };
  };

  const handleSend = (textToSend?: string) => {
    const queryText = textToSend || query;
    if (!queryText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processAIQuery(queryText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        recommendedTools: response.recommendedTools,
        workflow: response.workflow,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[250] bg-accent text-black font-syne font-bold px-4 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 cursor-pointer border-2 border-black ${
          isOpen ? 'hidden' : 'flex'
        }`}
      >
        <Sparkles size={18} className="animate-spin-slow" />
        <span className="text-xs uppercase tracking-wider hidden sm:inline">Ask Scout AI</span>
        <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse"></span>
      </button>

      {/* AI Assistant Chat Modal / Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[290] w-[calc(100vw-32px)] sm:w-[440px] h-[580px] max-h-[85vh] bg-black2 border border-border2 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-black3 px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                <Bot size={20} />
              </div>
              <div>
                <div className="font-syne font-bold text-sm text-white flex items-center gap-2">
                  Scout AI <span className="text-[10px] bg-accent text-black font-mono px-1.5 py-0.2 rounded font-bold">COPILOT</span>
                </div>
                <div className="text-[11px] text-white3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span> Live tool recommendation & workflows
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'ai',
                      text: "Hey! I'm **Scout AI**, your intelligent AI directory assistant. Tell me what task, workflow, or problem you want to solve, and I'll find the exact best tools and stacks for you.",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                title="Reset conversation"
                className="p-1.5 text-white3 hover:text-white rounded-lg transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white3 hover:text-white rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/60">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-accent text-black font-medium'
                      : 'bg-black3 border border-border2 text-white'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Workflow Card if present */}
                {msg.workflow && (
                  <div className="w-full mt-3 bg-black3/90 border border-accent/30 rounded-xl p-3.5 space-y-2">
                    <div className="font-syne text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={14} /> {msg.workflow.title}
                    </div>
                    <div className="space-y-2 pt-1">
                      {msg.workflow.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs bg-black2 p-2 rounded-lg border border-border">
                          <span className="font-mono text-accent font-bold text-[11px]">0{idx + 1}</span>
                          <div className="flex-1">
                            <div className="font-bold text-white flex items-center gap-1">
                              <span>{step.tool.icon}</span> {step.tool.name}
                              <span className="text-[10px] text-white3 font-normal">({step.tool.catLabel})</span>
                            </div>
                            <div className="text-white3 text-[11px] mt-0.5">{step.action}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Tools Cards */}
                {msg.recommendedTools && msg.recommendedTools.length > 0 && (
                  <div className="w-full mt-3 space-y-2">
                    {msg.recommendedTools.map(tool => (
                      <div
                        key={tool.id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/tool/${tool.id}`);
                        }}
                        className="bg-black3 hover:bg-black4 border border-border hover:border-accent/40 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-black2 border border-border flex items-center justify-center text-lg">
                            {tool.icon}
                          </div>
                          <div>
                            <div className="font-syne font-bold text-xs text-white group-hover:text-accent transition-colors flex items-center gap-1.5">
                              {tool.name}
                              <span className="badge bg-white/10 text-[9px] py-0.5 px-1.5">{tool.price}</span>
                            </div>
                            <div className="text-[11px] text-white3 line-clamp-1">{tool.desc}</div>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-white3 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-white3 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-white3 text-xs bg-black3 px-3.5 py-2 rounded-xl w-fit border border-border">
                <Sparkles size={14} className="animate-spin text-accent" /> Scout AI is searching catalog...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          {messages.length < 3 && (
            <div className="px-3 py-2 bg-black3/60 border-t border-border flex gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="bg-black2 hover:bg-black4 border border-border text-white2 hover:text-white text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-black3 border-t border-border flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything e.g. 'Best tool to edit podcasts'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-black2 border border-border2 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-accent"
            />
            <button
              onClick={() => handleSend()}
              disabled={!query.trim()}
              className="bg-accent text-black p-2.5 rounded-xl font-bold hover:opacity-85 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
