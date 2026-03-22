import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { account } from '../appwrite/config';

// ⚡ Accept the 'user' prop here
export default function Navbar({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      // A quick hackathon trick: force a hard reload on logout to instantly clear all React state
      window.location.href = '/'; 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0a0f1c]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section - Always visible */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate(user ? '/dashboard' : '/')}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <span className="text-white font-black text-xl">D</span>
            </div>
            <span className="text-xl font-black text-white tracking-tight">Dev<span className="text-blue-500">Clash</span></span>
          </div>

          {/* ⚡ ONLY render these center and right sections if 'user' exists */}
          {user && (
            <>
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    isActive('/dashboard') ? 'bg-white/10 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Test Generator
                </Link>
                <Link 
                  to="/progress" 
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    isActive('/progress') ? 'bg-white/10 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Neural Matrix
                </Link>
                <Link 
  to="/focus" 
  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
    isActive('/focus') ? 'bg-white/10 text-white shadow-md' : 'text-slate-400 hover:text-white'
  }`}
>
  Focus Player
</Link>
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-4">
                <div className="hidden md:block w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 border-2 border-[#0a0f1c] shadow-sm"></div>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-bold text-slate-400 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
          
        </div>
      </div>
    </nav>
  );
}