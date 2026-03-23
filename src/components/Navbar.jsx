import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { account } from '../appwrite/config';

export default function Navbar({ user }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      window.location.href = '/'; 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Updated User-Friendly Names
  const navLinks = [
    { name: 'Practice Tests', path: '/dashboard' },
    { name: 'Study Tracker', path: '/progress' },
    { name: 'Video Lectures', path: '/vault' },
    { name: 'Study Mode', path: '/focus' },
    {name: 'ai-MindMap',path:'/graph'}
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#05070a]/90 backdrop-blur-xl border-b border-emerald-500/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-black border border-emerald-500/50 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:border-emerald-400 transition-all duration-500">
                <span className="text-emerald-500 font-black text-2xl group-hover:text-emerald-300">D</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-widest text-white leading-none">
                  DEV<span className="text-emerald-500">CLASH</span>
                </span>
                <span className="text-[10px] text-emerald-500/60 font-bold tracking-[0.2em] uppercase">Academic OS</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Minimalist Tabs */}
          {user && (
            <div className="hidden md:flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-500 ${
                    isActive(link.path)
                      ? 'bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                      : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          {/* User Section */}
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-5">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest opacity-80">Online</span>
                  <span className="text-sm text-slate-200 font-bold">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="group relative px-4 py-2 bg-transparent overflow-hidden"
                >
                  <span className="relative z-10 text-[11px] font-black text-slate-400 group-hover:text-red-400 transition-colors tracking-widest uppercase">
                    Exit
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-red-500/0 group-hover:bg-red-500/50 transition-all duration-300"></div>
                </button>
              </div>
            ) : (
              <Link 
                to="/" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-black tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
              >
                ACCESS PORTAL
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Obsidian Dropdown */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden bg-[#05070a] border-b border-emerald-500/20 px-4 py-6 space-y-3 animate-in fade-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-5 py-4 rounded-xl font-bold text-sm tracking-widest uppercase ${
                isActive(link.path) ? 'bg-emerald-500 text-black' : 'text-slate-400 bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}