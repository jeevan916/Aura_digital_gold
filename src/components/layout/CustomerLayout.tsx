import React from 'react';

export const CustomerLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-md mx-auto min-h-screen bg-aurum-black shadow-2xl relative text-white">
    {children}
  </div>
);
