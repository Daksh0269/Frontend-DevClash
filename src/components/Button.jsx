import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  ...props 
}) {
  // ⚡ ADDED: cursor-pointer for the finger icon, and active:scale-95 for a physical "click" feel
  const baseStyle = "px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    // ⚡ ENHANCED: Added a gradient and a top border highlight so it pops off the dark background
    primary: "bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.6)] border border-blue-400/30",
    
    // ⚡ ENHANCED: Made the base background slightly lighter (10% opacity) with a stronger border
    outline: "bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-slate-200 backdrop-blur-sm shadow-sm",
    
    success: "bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.6)] border border-emerald-400/30",
    
    danger: "bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-400/70 text-red-400 hover:text-red-300 backdrop-blur-sm",
    
    ghost: "bg-transparent hover:bg-white/10 text-slate-400 hover:text-slate-200 px-4 py-2" 
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
}