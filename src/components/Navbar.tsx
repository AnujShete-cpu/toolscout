import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowSearch(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      <nav className="fixed top-0 left-0 right-0 z-[200] px-4 md:px-12 h-[70px] flex items-center justify-between bg-[rgba(10,10,10,0.92)] backdrop-blur-[16px] border-b border-border">
        <div className="flex items-center gap-2">
          <Link to="/" className="logo">
            <span className="logo-dot"></span>
            ToolScout
          </Link>
        </div>

        <ul className="hidden md:flex list-none gap-8 absolute left-1/2 -translate-x-1/2">
          <li><Link to="/browse" className="nav-link text-white2 hover:text-white transition-colors uppercase text-[13px] font-medium tracking-[0.06em]">Browse</Link></li>
          <li><Link to="/categories" className="nav-link text-white2 hover:text-white transition-colors uppercase text-[13px] font-medium tracking-[0.06em]">Categories</Link></li>
          <li><Link to="/how-it-works" className="nav-link text-white2 hover:text-white transition-colors uppercase text-[13px] font-medium tracking-[0.06em]">How it works</Link></li>
          <li><Link to="/profile" className="nav-link text-white2 hover:text-white transition-colors uppercase text-[13px] font-medium tracking-[0.06em]">Profile</Link></li>
        </ul>

        <div className="flex items-center gap-4 md:gap-10">
          <div className="relative flex items-center justify-end min-w-[100px]">
            {showSearch && (
              <div className="hidden lg:flex items-center bg-black3 border border-border2 h-[38px] focus-within:border-accent transition-colors">
                <form onSubmit={handleSearch} className="flex items-center h-full">
                  <input
                    type="text"
                    placeholder="Search tools..."
                    className="bg-transparent border-none outline-none text-white font-body text-[13px] italic px-3 w-[200px] h-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="bg-accent text-black border-none h-full px-4 font-syne text-[11px] font-bold uppercase tracking-[0.06em] cursor-pointer hover:opacity-85 whitespace-nowrap">
                    Go
                  </button>
                </form>
              </div>
            )}
          </div>

          <button
            className="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-[6px] z-[210]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} color="var(--white)" /> : <Menu size={24} color="var(--white)" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed top-[70px] left-0 right-0 bg-[rgba(10,10,10,0.98)] backdrop-blur-[20px] border-b border-border z-[199] p-6 flex-col gap-0 transition-all duration-300 md:hidden",
        isMenuOpen ? "flex" : "hidden"
      )}>
        <Link to="/" className="text-white2 font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-4 border-b border-border" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link to="/browse" className="text-white2 font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-4 border-b border-border" onClick={() => setIsMenuOpen(false)}>Browse</Link>
        <Link to="/categories" className="text-white2 font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-4 border-b border-border" onClick={() => setIsMenuOpen(false)}>Categories</Link>
        <Link to="/how-it-works" className="text-white2 font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-4 border-b border-border" onClick={() => setIsMenuOpen(false)}>How it works</Link>
        <Link to="/profile" className="text-white2 font-syne text-[15px] font-semibold uppercase tracking-[0.06em] py-4 border-b border-border" onClick={() => setIsMenuOpen(false)}>Profile</Link>

        <form onSubmit={handleSearch} className="flex mt-5 border border-border2">
          <input
            type="text"
            placeholder="Search tools..."
            className="flex-1 bg-black3 border-none outline-none text-white font-body text-sm italic p-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="bg-accent text-black border-none px-4 font-syne text-[11px] font-bold uppercase cursor-pointer">
            Go
          </button>
        </form>
      </div>
    </>
  );
}
