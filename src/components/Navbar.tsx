import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Plus, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import AddToolModal from './AddToolModal';
import { isAdminAuthenticated } from '../lib/adminAuth';

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());

  useEffect(() => {
    const handleScroll = () => {
      setShowSearch(window.scrollY > 150);
    };
    const handleAdminChanged = (e: any) => {
      setIsAdmin(Boolean(e.detail));
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('toolscout_admin_changed', handleAdminChanged);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('toolscout_admin_changed', handleAdminChanged);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[200] px-4 md:px-8 lg:px-12 h-[70px] flex items-center justify-between bg-[rgba(10,10,10,0.92)] backdrop-blur-[16px] border-b border-border">
        <div className="flex items-center gap-2">
          <Link to="/" className="logo">
            <span className="logo-dot"></span>
            ToolScout
          </Link>
        </div>

        <ul className="hidden lg:flex list-none gap-6 xl:gap-8 absolute left-1/2 -translate-x-1/2">
          <li>
            <Link to="/browse" className="nav-link text-white2 hover:text-white transition-colors uppercase text-[13px] font-medium tracking-[0.06em]">
              Browse
            </Link>
          </li>
          <li>
            <Link to="/categories" className="nav-link text-white2 hover:text-white transition-colors uppercase text-[13px] font-medium tracking-[0.06em]">
              Categories
            </Link>
          </li>
          <li>
            <Link to="/compare" className="nav-link text-white2 hover:text-white transition-colors uppercase text-[13px] font-medium tracking-[0.06em]">
              Compare
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/manage" className="nav-link text-accent hover:text-white transition-colors uppercase text-[13px] font-medium tracking-[0.06em] flex items-center gap-1">
                <ShieldCheck size={13} /> Manage Tools
              </Link>
            </li>
          )}
          <li>
            <Link to="/profile" className="nav-link text-white2 hover:text-white transition-colors uppercase text-[13px] font-medium tracking-[0.06em]">
              Profile
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Admin-only Add Tool Button */}
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-accent text-black font-syne text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-accent/10 cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} /> <span className="hidden sm:inline">+ Add</span> Tool
            </button>
          )}

          <div className="relative hidden sm:flex items-center justify-end">
            {showSearch && (
              <div className="hidden xl:flex items-center bg-black3 border border-border2 h-[36px] focus-within:border-accent transition-colors rounded-lg overflow-hidden">
                <form onSubmit={handleSearch} className="flex items-center h-full">
                  <input
                    type="text"
                    placeholder="Search tools..."
                    className="bg-transparent border-none outline-none text-white font-body text-[12px] italic px-3 w-[180px] h-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="bg-accent text-black border-none h-full px-3 font-syne text-[11px] font-bold uppercase tracking-[0.06em] cursor-pointer hover:opacity-85 whitespace-nowrap">
                    Go
                  </button>
                </form>
              </div>
            )}
          </div>

          <button
            className="lg:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-[6px] z-[210]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} color="var(--white)" /> : <Menu size={24} color="var(--white)" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed top-[70px] left-0 right-0 bg-[rgba(10,10,10,0.98)] backdrop-blur-[20px] border-b border-border z-[199] p-6 flex-col gap-0 transition-all duration-300 lg:hidden",
        isMenuOpen ? "flex" : "hidden"
      )}>
        <Link to="/" className="text-white2 font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-3.5 border-b border-border" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link to="/browse" className="text-white2 font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-3.5 border-b border-border" onClick={() => setIsMenuOpen(false)}>Browse</Link>
        <Link to="/categories" className="text-white2 font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-3.5 border-b border-border" onClick={() => setIsMenuOpen(false)}>Categories</Link>
        <Link to="/compare" className="text-white2 font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-3.5 border-b border-border" onClick={() => setIsMenuOpen(false)}>Compare</Link>
        {isAdmin && (
          <Link to="/manage" className="text-accent font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-3.5 border-b border-border flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
            <span>Manage Tools</span>
            <span className="text-xs bg-accent text-black font-bold px-2 py-0.5 rounded font-mono">ADMIN</span>
          </Link>
        )}
        <Link to="/profile" className="text-white2 font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-3.5 border-b border-border" onClick={() => setIsMenuOpen(false)}>Profile</Link>

        <div className="pt-4 flex flex-col gap-3">
          {isAdmin && (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsAddModalOpen(true);
              }}
              className="w-full bg-accent text-black font-syne text-xs uppercase font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Plus size={16} /> + Add New Website / Tool
            </button>
          )}

          <form onSubmit={handleSearch} className="flex border border-border2 rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="Search tools..."
              className="flex-1 bg-black3 border-none outline-none text-white font-body text-xs italic p-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-accent text-black border-none px-4 font-syne text-[11px] font-bold uppercase cursor-pointer">
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Global Add Tool Modal (Admin) */}
      <AddToolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
