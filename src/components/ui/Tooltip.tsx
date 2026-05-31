'use client';

import React from 'react';

interface TooltipProps {
  text: string;
  isVisible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ text, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute bottom-[calc(100%+15px)] left-1/2 -translate-x-1/2 
        w-[240px] bg-white p-[14px] rounded-[10px] 
        shadow-[0px_10px_25px_rgba(0,0,0,0.15)] border border-[#EAEBF0] 
        z-[1000] pointer-events-none
        animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
    >
      <p className="font-rajdhani text-[13px] font-medium leading-[18px] text-[#242424] text-center">
        {text}
      </p>
      
      {/* Tooltip Arrow */}
      <div 
        className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-0 h-0 
        border-l-[10px] border-l-transparent 
        border-r-[10px] border-r-transparent 
        border-t-[10px] border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]"
      />
    </div>
  );
};

export default Tooltip;
