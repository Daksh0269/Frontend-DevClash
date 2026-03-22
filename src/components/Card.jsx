import React from 'react';

export default function Card({ children, className = '', hoverEffect = false }) {
  return (
    <div className={`
      bg-white/5 border border-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl 
      ${hoverEffect ? 'hover:bg-white/10 hover:border-white/10 transition-all duration-300' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
}