import React from 'react';

export function GeometricBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#020408]">
      {/* Base Grid - Isometric Cubes Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 52L60 34.641V0M30 52V86.6025M30 52L0 34.641V0M60 34.641L30 17.3205L0 34.641' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3Cpath d='M30 104V86.6025M0 69.282L30 86.6025L60 69.282V34.641' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 104px'
        }}
      />
      
      {/* Radial Gradient for Vignette/Depth */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#020408]/50 to-[#020408]" />
      
      {/* Subtle Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
    </div>
  );
}
