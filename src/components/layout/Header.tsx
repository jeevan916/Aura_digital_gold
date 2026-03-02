import React from 'react';

export const Header = () => (
  <header className="bg-background/80 backdrop-blur-xl py-6 px-6 flex justify-between items-center sticky top-0 z-40 border-b border-white/[0.05]">
    <div className="flex items-center gap-3">
      <div className="brand-gradient w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg neon-glow-primary">A</div>
      <h1 className="text-2xl font-black tracking-tighter text-white">AURUM<span className="text-brand-primary">.</span></h1>
    </div>
    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
      <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
    </div>
  </header>
);
