import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Download, Upload, RefreshCw, Search, Sparkles, ExternalLink, Check, Lock, LogOut, KeyRound } from 'lucide-react';
import { getAllTools, getStoredCustomTools, deleteTool, updateTool, exportCatalogJSON, importCatalogJSON, resetToDefaults, TOOL_CATEGORIES } from '../lib/toolStore';
import { Tool } from '../types';
import AddToolModal from '../components/AddToolModal';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, loginAdmin, logoutAdmin, setAdminPasscode } from '../lib/adminAuth';

export default function ManageTools() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showPasscodeChange, setShowPasscodeChange] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');

  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const refreshList = () => {
    setTools(getAllTools());
  };

  useEffect(() => {
    refreshList();
    const handleToolsUpdated = () => refreshList();
    const handleAdminChanged = (e: any) => setIsAdmin(Boolean(e.detail));

    window.addEventListener('toolscout_tools_updated', handleToolsUpdated);
    window.addEventListener('toolscout_admin_changed', handleAdminChanged);

    return () => {
      window.removeEventListener('toolscout_tools_updated', handleToolsUpdated);
      window.removeEventListener('toolscout_admin_changed', handleAdminChanged);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    if (loginAdmin(passcode)) {
      setIsAdmin(true);
      setPasscode('');
    } else {
      setPasscodeError('Incorrect admin passcode. Try "admin".');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
  };

  const handleSaveNewPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.trim().length < 3) {
      alert('Passcode must be at least 3 characters');
      return;
    }
    setAdminPasscode(newPasscode.trim());
    setShowPasscodeChange(false);
    setNewPasscode('');
    alert('Admin passcode updated successfully!');
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the active directory?`)) {
      deleteTool(id);
      const event = new CustomEvent('show-toast', { detail: `Removed "${name}" from catalog` });
      window.dispatchEvent(event);
    }
  };

  const handleExport = () => {
    const jsonStr = exportCatalogJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolscout-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importCatalogJSON(content);
      if (res.success) {
        setImportStatus(`Successfully imported ${res.count} tools!`);
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus(`Import error: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    updateTool(editingTool.id, {
      name: editingTool.name,
      url: editingTool.url,
      cat: editingTool.cat,
      catLabel: TOOL_CATEGORIES.find(c => c.value === editingTool.cat)?.label || editingTool.catLabel,
      icon: editingTool.icon,
      desc: editingTool.desc,
      price: editingTool.price,
      rating: Number(editingTool.rating) || 4.8,
      ratingCount: editingTool.ratingCount,
      featured: editingTool.featured,
    });

    setEditingTool(null);
    const event = new CustomEvent('show-toast', { detail: `Updated "${editingTool.name}"` });
    window.dispatchEvent(event);
  };

  const handleResetCatalog = () => {
    resetToDefaults();
    setConfirmReset(false);
    const event = new CustomEvent('show-toast', { detail: 'Reset catalog to original presets' });
    window.dispatchEvent(event);
  };

  // If Not Logged In as Admin -> Show Admin Passcode Prompt
  if (!isAdmin) {
    return (
      <div className="page active min-h-[85vh] flex items-center justify-center px-4 pt-[90px] pb-20">
        <div className="bg-black2 border border-border2 max-w-md w-full p-8 rounded-2xl shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mx-auto mb-4 text-2xl">
            <Lock size={26} />
          </div>
          <h2 className="font-syne text-2xl font-bold uppercase text-white tracking-tight mb-2">
            Site Owner Access
          </h2>
          <p className="text-white3 text-xs mb-6">
            Adding and editing tools is restricted to you as the website owner. Enter your passcode to unlock catalog controls.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              autoFocus
              placeholder="Enter Admin Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-black3 border border-border2 text-white text-center text-sm px-4 py-3 rounded-xl outline-none focus:border-accent font-mono tracking-widest"
            />

            {passcodeError && (
              <div className="text-accent2 text-xs font-mono">{passcodeError}</div>
            )}

            <button
              type="submit"
              className="w-full bg-accent text-black font-syne text-xs uppercase font-bold py-3.5 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-accent/10"
            >
              Unlock Admin Mode
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-[11px] text-white3">
            Default passcode: <span className="font-mono text-white">admin</span> (can be customized once logged in).
          </div>
        </div>
      </div>
    );
  }

  const customTools = getStoredCustomTools();
  const customIds = new Set(customTools.map(t => t.id));

  const filteredTools = tools.filter(t => {
    const matchesCat = selectedCat === 'all' ? true : selectedCat === 'custom' ? customIds.has(t.id) : t.cat === selectedCat;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ? true : (
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.catLabel.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    );
    return matchesCat && matchesSearch;
  });

  return (
    <div className="page active min-h-screen pt-[90px] pb-20 px-4 md:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border mb-8">
        <div>
          <div className="sec-label !text-xs !mb-1 text-accent flex items-center gap-1.5">
            <Sparkles size={14} /> Private Owner Dashboard
          </div>
          <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
            Manage <em className="text-accent not-italic">Websites</em> & Tools
          </h1>
          <p className="text-white3 text-sm mt-2 max-w-xl">
            Add new websites on the fly without touching code. Edit information, auto-fill with AI, or export/import your entire catalog dataset.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-accent text-black font-syne text-xs uppercase font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-accent/10 cursor-pointer"
          >
            <Plus size={16} /> + Add New Website / Tool
          </button>

          <button
            onClick={handleExport}
            className="bg-black3 border border-border2 hover:border-white2 text-white font-syne text-xs uppercase font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            title="Download full JSON dataset"
          >
            <Download size={15} /> Export JSON
          </button>

          <label className="bg-black3 border border-border2 hover:border-white2 text-white font-syne text-xs uppercase font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer">
            <Upload size={15} /> Import JSON
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => setShowPasscodeChange(true)}
            className="p-3 bg-black3 border border-border hover:border-white2 text-white3 hover:text-white rounded-xl transition-colors"
            title="Change Admin Passcode"
          >
            <KeyRound size={16} />
          </button>

          <button
            onClick={handleLogout}
            className="p-3 bg-black3 border border-border hover:border-accent2 text-white3 hover:text-accent2 rounded-xl transition-colors"
            title="Lock & Logout Admin"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="bg-accent/15 border border-accent/40 text-accent text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2 animate-fadeIn">
          <Check size={16} /> {importStatus}
        </div>
      )}

      {/* Stats and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black2 border border-border p-4 rounded-xl">
          <div className="text-white3 text-xs font-mono uppercase">Total Catalog</div>
          <div className="text-2xl font-syne font-bold text-white mt-1">{tools.length} Tools</div>
        </div>
        <div className="bg-black2 border border-border p-4 rounded-xl">
          <div className="text-white3 text-xs font-mono uppercase">Custom Added</div>
          <div className="text-2xl font-syne font-bold text-accent mt-1">{customTools.length} Custom</div>
        </div>
        <div className="bg-black2 border border-border p-4 rounded-xl">
          <div className="text-white3 text-xs font-mono uppercase">Featured Tools</div>
          <div className="text-2xl font-syne font-bold text-white mt-1">
            {tools.filter(t => t.featured).length}
          </div>
        </div>
        <div className="bg-black2 border border-border p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-white3 text-xs font-mono uppercase">Reset Database</div>
            <div className="text-xs text-white2 mt-1">Restore factory catalog</div>
          </div>
          {confirmReset ? (
            <div className="flex gap-2">
              <button
                onClick={handleResetCatalog}
                className="bg-accent2 text-white text-xs px-3 py-1 rounded font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="bg-black4 text-white text-xs px-2 py-1 rounded"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-white3 hover:text-accent2 transition-colors p-2"
              title="Reset catalog"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white3" />
          <input
            type="text"
            placeholder="Search tools by name, description, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black2 border border-border2 text-white text-xs pl-10 pr-4 py-3 rounded-xl outline-none focus:border-accent"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="bg-black2 border border-border2 text-white text-xs px-4 py-3 rounded-xl outline-none focus:border-accent min-w-[180px]"
        >
          <option value="all">All Categories</option>
          <option value="custom">★ Custom Added Only ({customTools.length})</option>
          {TOOL_CATEGORIES.filter(c => c.value !== 'all').map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table of Tools */}
      <div className="bg-black2 border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-black3 text-[11px] font-syne font-bold uppercase tracking-wider text-white3">
                <th className="p-4 w-12">ID</th>
                <th className="p-4">Tool / Website</th>
                <th className="p-4">Category</th>
                <th className="p-4">Pricing</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Website Link</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredTools.length > 0 ? (
                filteredTools.map(tool => {
                  const isCustom = customIds.has(tool.id);
                  return (
                    <tr key={tool.id} className="hover:bg-black3/50 transition-colors">
                      <td className="p-4 font-mono text-white3">{tool.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tool.icon}</span>
                          <div>
                            <div className="font-syne font-bold text-white flex items-center gap-2">
                              {tool.name}
                              {isCustom && (
                                <span className="bg-accent/20 text-accent border border-accent/40 font-mono text-[9px] px-1.5 py-0.2 rounded">
                                  CUSTOM
                                </span>
                              )}
                              {tool.featured && (
                                <span className="bg-white/10 text-white font-mono text-[9px] px-1.5 py-0.2 rounded">
                                  FEATURED
                                </span>
                              )}
                            </div>
                            <div className="text-white3 text-[11px] max-w-xs truncate">{tool.desc}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-black3 border border-border text-white2 px-2.5 py-1 rounded-md text-[11px]">
                          {tool.catLabel}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-white">{tool.price}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-[#f0c040]">★ {tool.rating}</span>
                        <span className="text-white3 text-[11px] ml-1">({tool.ratingCount})</span>
                      </td>
                      <td className="p-4">
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline flex items-center gap-1 max-w-[160px] truncate"
                        >
                          {tool.url.replace(/^https?:\/\/(www\.)?/, '')}
                          <ExternalLink size={12} className="flex-shrink-0" />
                        </a>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/tool/${tool.id}`)}
                            className="p-1.5 text-white3 hover:text-white bg-black3 rounded-lg border border-border hover:border-white2 transition-all"
                            title="View Detail Page"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={() => setEditingTool(tool)}
                            className="p-1.5 text-white3 hover:text-accent bg-black3 rounded-lg border border-border hover:border-accent transition-all"
                            title="Edit Tool"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(tool.id, tool.name)}
                            className="p-1.5 text-white3 hover:text-accent2 bg-black3 rounded-lg border border-border hover:border-accent2 transition-all"
                            title="Delete Tool"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white3 italic">
                    No tools found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Passcode Modal */}
      {showPasscodeChange && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-black2 border border-border2 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
            <h3 className="font-syne text-lg font-bold uppercase text-white mb-2">Change Admin Passcode</h3>
            <p className="text-white3 text-xs mb-4">Set a custom password to lock catalog control.</p>
            <form onSubmit={handleSaveNewPasscode} className="space-y-4">
              <input
                type="text"
                placeholder="New passcode"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                className="w-full bg-black3 border border-border text-white text-xs p-3 rounded-lg outline-none focus:border-accent"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasscodeChange(false)}
                  className="px-3 py-2 text-white3 text-xs uppercase font-syne"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent text-black px-4 py-2 text-xs font-syne font-bold uppercase rounded-lg"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tool Modal */}
      {editingTool && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-black2 border border-border2 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative">
            <h3 className="font-syne text-xl font-bold uppercase text-white mb-4">
              Edit Tool: {editingTool.name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-syne text-white3 uppercase mb-1">Name</label>
                  <input
                    type="text"
                    value={editingTool.name}
                    onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                    className="w-full bg-black3 border border-border text-white text-xs p-2.5 rounded-lg outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-syne text-white3 uppercase mb-1">Icon</label>
                  <input
                    type="text"
                    value={editingTool.icon}
                    onChange={(e) => setEditingTool({ ...editingTool, icon: e.target.value })}
                    className="w-full bg-black3 border border-border text-white text-center text-lg py-1.5 rounded-lg outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-syne text-white3 uppercase mb-1">Website URL</label>
                <input
                  type="text"
                  value={editingTool.url}
                  onChange={(e) => setEditingTool({ ...editingTool, url: e.target.value })}
                  className="w-full bg-black3 border border-border text-white text-xs p-2.5 rounded-lg outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-syne text-white3 uppercase mb-1">Category</label>
                  <select
                    value={editingTool.cat}
                    onChange={(e) => setEditingTool({ ...editingTool, cat: e.target.value })}
                    className="w-full bg-black3 border border-border text-white text-xs p-2.5 rounded-lg outline-none focus:border-accent"
                  >
                    {TOOL_CATEGORIES.filter(c => c.value !== 'all').map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-syne text-white3 uppercase mb-1">Price Label</label>
                  <input
                    type="text"
                    value={editingTool.price}
                    onChange={(e) => setEditingTool({ ...editingTool, price: e.target.value })}
                    className="w-full bg-black3 border border-border text-white text-xs p-2.5 rounded-lg outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-syne text-white3 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingTool.desc}
                  onChange={(e) => setEditingTool({ ...editingTool, desc: e.target.value })}
                  className="w-full bg-black3 border border-border text-white text-xs p-2.5 rounded-lg outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={editingTool.featured}
                  onChange={(e) => setEditingTool({ ...editingTool, featured: e.target.checked })}
                  className="accent-accent"
                />
                <label htmlFor="edit-featured" className="text-white text-xs cursor-pointer">
                  Featured on Homepage
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingTool(null)}
                  className="px-4 py-2 rounded-lg border border-border text-white2 text-xs font-syne uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent text-black px-5 py-2 rounded-lg font-syne text-xs uppercase font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tool Modal */}
      <AddToolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refreshList();
        }}
      />
    </div>
  );
}
