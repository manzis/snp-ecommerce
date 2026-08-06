'use client';

import React from 'react';

/**
 * AnimatedSuccessIcon
 * A highly performant, pure CSS animated SVG success icon.
 * Features rotating scalloped badges with a tight gap, a pulsing inner badge,
 * and twinkling plus/diamond sparkles.
 */
export default function AnimatedSuccessIcon() {
  return (
    <div className="relative flex items-center justify-center w-[160px] h-[160px]">
      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinSlowReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulseOuter {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.05); }
          100% { transform: scale(0.95); }
        }
        @keyframes drawCheck {
          0% { stroke-dashoffset: 60; opacity: 0; }
          10% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        
        /* 8-Direction Splash Sprinkles + Extra Top-Left */
        @keyframes pop1 { 0% { transform: translate(0,0) scale(0) rotate(0deg); opacity: 0; } 20% { opacity: 1; transform: translate(-30px, -50px) scale(1.2) rotate(45deg); } 100% { transform: translate(-45px, -75px) scale(0.5) rotate(90deg); opacity: 0; } }
        @keyframes pop2 { 0% { transform: translate(0,0) scale(0) rotate(0deg); opacity: 0; } 20% { opacity: 1; transform: translate(40px, -45px) scale(1.2) rotate(-45deg); } 100% { transform: translate(60px, -65px) scale(0.5) rotate(-90deg); opacity: 0; } }
        @keyframes pop3 { 0% { transform: translate(0,0) scale(0); opacity: 0; } 20% { opacity: 1; transform: translate(55px, 5px) scale(1.2); } 100% { transform: translate(80px, 10px) scale(0.5); opacity: 0; } }
        @keyframes pop4 { 0% { transform: translate(0,0) scale(0) rotate(0deg); opacity: 0; } 20% { opacity: 1; transform: translate(40px, 50px) scale(1.2) rotate(45deg); } 100% { transform: translate(60px, 70px) scale(0.5) rotate(90deg); opacity: 0; } }
        @keyframes pop5 { 0% { transform: translate(0,0) scale(0); opacity: 0; } 20% { opacity: 1; transform: translate(-10px, 55px) scale(1.2); } 100% { transform: translate(-15px, 80px) scale(0.5); opacity: 0; } }
        @keyframes pop6 { 0% { transform: translate(0,0) scale(0) rotate(0deg); opacity: 0; } 20% { opacity: 1; transform: translate(-45px, 40px) scale(1.2) rotate(-45deg); } 100% { transform: translate(-65px, 55px) scale(0.5) rotate(-90deg); opacity: 0; } }
        @keyframes pop7 { 0% { transform: translate(0,0) scale(0); opacity: 0; } 20% { opacity: 1; transform: translate(-55px, -5px) scale(1.2); } 100% { transform: translate(-80px, -10px) scale(0.5); opacity: 0; } }
        @keyframes pop8 { 0% { transform: translate(0,0) scale(0) rotate(0deg); opacity: 0; } 20% { opacity: 1; transform: translate(15px, -60px) scale(1.2) rotate(45deg); } 100% { transform: translate(20px, -90px) scale(0.5) rotate(90deg); opacity: 0; } }
        @keyframes pop9 { 0% { transform: translate(0,0) scale(0); opacity: 0; } 20% { opacity: 1; transform: translate(-20px, -40px) scale(1.2); } 100% { transform: translate(-30px, -60px) scale(0.5); opacity: 0; } }
        @keyframes pop10 { 0% { transform: translate(0,0) scale(0) rotate(0deg); opacity: 0; } 20% { opacity: 1; transform: translate(-50px, -30px) scale(1.2) rotate(-45deg); } 100% { transform: translate(-70px, -45px) scale(0.5) rotate(-90deg); opacity: 0; } }
        
        @keyframes waitToAppear {
          0% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes rotateBlink1 {
          0%, 100% { opacity: 0.2; transform: rotate(0deg) scale(0.8); }
          50% { opacity: 1; transform: rotate(180deg) scale(1.2); }
        }
        @keyframes rotateBlink2 {
          0%, 100% { opacity: 0.2; transform: rotate(90deg) scale(1.1); }
          50% { opacity: 1; transform: rotate(-90deg) scale(0.8); }
        }
        @keyframes rotateBlink3 {
          0%, 100% { opacity: 0.2; transform: rotate(45deg) scale(0.9); }
          50% { opacity: 1; transform: rotate(225deg) scale(1.3); }
        }
        
        .outer-badge-wrapper {
          animation: pulseOuter 3.5s ease-in-out infinite;
          transform-origin: center;
        }
        .outer-badge {
          animation: spinSlow 25s linear infinite;
          transform-origin: center;
        }
        .inner-badge-wrapper {
          transform-origin: center;
        }
        .inner-badge {
          animation: spinSlowReverse 20s linear infinite;
          transform-origin: center;
        }
        .check-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          opacity: 0;
          animation: drawCheck 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.1s;
        }
        .short-shadow {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          opacity: 0;
          animation: drawCheck 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.15s;
        }
        
        /* Floating Plus Icons Timing */
        .plus-1 { opacity: 0; animation: waitToAppear 1.2s forwards, rotateBlink1 3s infinite ease-in-out 1.2s; }
        .plus-2 { opacity: 0; animation: waitToAppear 1.5s forwards, rotateBlink2 4s infinite ease-in-out 1.5s; }
        .plus-3 { opacity: 0; animation: waitToAppear 1.8s forwards, rotateBlink3 3.5s infinite ease-in-out 1.8s; }
        
        /* Sprinkles Timing */
        .sp-1 { animation: pop1 1.2s ease-out forwards; animation-delay: 0.05s; transform-origin: center; opacity: 0; }
        .sp-2 { animation: pop2 1.3s ease-out forwards; animation-delay: 0.15s; transform-origin: center; opacity: 0; }
        .sp-3 { animation: pop3 1.2s ease-out forwards; animation-delay: 0.1s; transform-origin: center; opacity: 0; }
        .sp-4 { animation: pop4 1.4s ease-out forwards; animation-delay: 0.2s; transform-origin: center; opacity: 0; }
        .sp-5 { animation: pop5 1.2s ease-out forwards; animation-delay: 0.05s; transform-origin: center; opacity: 0; }
        .sp-6 { animation: pop6 1.3s ease-out forwards; animation-delay: 0.15s; transform-origin: center; opacity: 0; }
        .sp-7 { animation: pop7 1.1s ease-out forwards; animation-delay: 0.0s; transform-origin: center; opacity: 0; }
        .sp-8 { animation: pop8 1.4s ease-out forwards; animation-delay: 0.25s; transform-origin: center; opacity: 0; }
        .sp-9 { animation: pop9 1.3s ease-out forwards; animation-delay: 0.1s; transform-origin: center; opacity: 0; }
        .sp-10 { animation: pop10 1.2s ease-out forwards; animation-delay: 0.2s; transform-origin: center; opacity: 0; }
      `}</style>

      <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
        
        <defs>
          <linearGradient id="inner-stroke-grad" x1="0" y1="20" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#AEEAA5" />
            <stop offset="100%" stopColor="white" />
          </linearGradient>
          {/* Mask for inner outline, using the tighter inner size */}
          <mask id="badge-outline-mask">
            <g className="inner-badge-wrapper">
              <g className="inner-badge">
                {/* Strokes */}
                <rect x="22" y="22" width="76" height="76" rx="6" fill="none" stroke="white" strokeWidth="6" strokeLinejoin="round" transform="rotate(0 60 60)" />
                <rect x="22" y="22" width="76" height="76" rx="6" fill="none" stroke="white" strokeWidth="6" strokeLinejoin="round" transform="rotate(22.5 60 60)" />
                <rect x="22" y="22" width="76" height="76" rx="6" fill="none" stroke="white" strokeWidth="6" strokeLinejoin="round" transform="rotate(45 60 60)" />
                <rect x="22" y="22" width="76" height="76" rx="6" fill="none" stroke="white" strokeWidth="6" strokeLinejoin="round" transform="rotate(67.5 60 60)" />
                {/* Fills */}
                <rect x="22" y="22" width="76" height="76" rx="6" fill="black" transform="rotate(0 60 60)" />
                <rect x="22" y="22" width="76" height="76" rx="6" fill="black" transform="rotate(22.5 60 60)" />
                <rect x="22" y="22" width="76" height="76" rx="6" fill="black" transform="rotate(45 60 60)" />
                <rect x="22" y="22" width="76" height="76" rx="6" fill="black" transform="rotate(67.5 60 60)" />
              </g>
            </g>
          </mask>
        </defs>

        {/* Exploding Sprinkles Layer */}
        <g transform="translate(60, 60)">
          <g className="sp-1"><path d="M-4 0 L4 0 M0 -4 L0 4" stroke="#1DB878" strokeWidth="2.5" strokeLinecap="round" /></g>
          <g className="sp-2"><path d="M-3 0 L3 0 M0 -3 L0 3" stroke="#AEEAA5" strokeWidth="2.5" strokeLinecap="round" /><circle cx="12" cy="8" r="2" fill="#ffe900" /></g>
          <g className="sp-3"><circle cx="0" cy="0" r="3" fill="#1DB878" /></g>
          <g className="sp-4"><path d="M-4 0 L4 0 M0 -4 L0 4" stroke="#ffe900" strokeWidth="2.5" strokeLinecap="round" /></g>
          <g className="sp-5"><circle cx="0" cy="0" r="2.5" fill="#AEEAA5" /></g>
          <g className="sp-6"><path d="M-4 0 L4 0 M0 -4 L0 4" stroke="#1DB878" strokeWidth="2.5" strokeLinecap="round" /><circle cx="-10" cy="-10" r="1.5" fill="#AEEAA5" /></g>
          <g className="sp-7"><circle cx="0" cy="0" r="2" fill="#ffe900" /></g>
          <g className="sp-8"><path d="M-3 0 L3 0 M0 -3 L0 3" stroke="#AEEAA5" strokeWidth="2.5" strokeLinecap="round" /></g>
          {/* Extra Top Left */}
          <g className="sp-9"><circle cx="0" cy="0" r="2" fill="#ffe900" /></g>
          <g className="sp-10"><path d="M-3 0 L3 0 M0 -3 L0 3" stroke="#AEEAA5" strokeWidth="2.5" strokeLinecap="round" /></g>
        </g>

        {/* Outer Scalloped Badge (Light Green) - Tighter Gap with Pulsing */}
        <g className="outer-badge-wrapper">
          <g className="outer-badge">
            <rect x="15" y="15" width="90" height="90" rx="8" fill="#AEEAA5" transform="rotate(0 60 60)" />
            <rect x="15" y="15" width="90" height="90" rx="8" fill="#AEEAA5" transform="rotate(22.5 60 60)" />
            <rect x="15" y="15" width="90" height="90" rx="8" fill="#AEEAA5" transform="rotate(45 60 60)" />
            <rect x="15" y="15" width="90" height="90" rx="8" fill="#AEEAA5" transform="rotate(67.5 60 60)" />
          </g>
        </g>

        {/* Inner Scalloped Badge (Dark Green) - Shadow Layer */}
        <g transform="translate(3, 3)">
          <g className="inner-badge-wrapper">
            <g className="inner-badge">
              <rect x="22" y="22" width="76" height="76" rx="6" fill="#159863" stroke="#159863" strokeWidth="6" strokeLinejoin="round" transform="rotate(0 60 60)" />
              <rect x="22" y="22" width="76" height="76" rx="6" fill="#159863" stroke="#159863" strokeWidth="6" strokeLinejoin="round" transform="rotate(22.5 60 60)" />
              <rect x="22" y="22" width="76" height="76" rx="6" fill="#159863" stroke="#159863" strokeWidth="6" strokeLinejoin="round" transform="rotate(45 60 60)" />
              <rect x="22" y="22" width="76" height="76" rx="6" fill="#159863" stroke="#159863" strokeWidth="6" strokeLinejoin="round" transform="rotate(67.5 60 60)" />
            </g>
          </g>
        </g>

        {/* Inner Scalloped Badge - Gradient Outline masked to shape */}
        <rect x="0" y="0" width="120" height="120" fill="url(#inner-stroke-grad)" mask="url(#badge-outline-mask)" />

        {/* Inner Scalloped Badge - Solid Fill & Checkmark */}
        <g className="inner-badge-wrapper">
          <g className="inner-badge">
            <rect x="22" y="22" width="76" height="76" rx="6" fill="#1DB878" transform="rotate(0 60 60)" />
            <rect x="22" y="22" width="76" height="76" rx="6" fill="#1DB878" transform="rotate(22.5 60 60)" />
            <rect x="22" y="22" width="76" height="76" rx="6" fill="#1DB878" transform="rotate(45 60 60)" />
            <rect x="22" y="22" width="76" height="76" rx="6" fill="#1DB878" transform="rotate(67.5 60 60)" />
          </g>

          {/* Simple Drop Shadow on the Checkmark */}
          <path 
            className="short-shadow"
            pathLength="100"
            d="M 46 62 L 56 72 L 76 48" 
            stroke="#16a36a" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
            transform="translate(3, 3)" 
          />

          {/* Checkmark (White) */}
          <path 
            className="check-path"
            pathLength="100"
            d="M 46 62 L 56 72 L 76 48" 
            stroke="white" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
        </g>

        {/* Floating Plus Icons (Post-Splash) - Rendered on Top */}
        <g transform="translate(115, 5)">
          <g className="plus-1">
            <path d="M-5 0 L5 0 M0 -5 L0 5" stroke="#ffe900" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
        <g transform="translate(5, 115)">
          <g className="plus-2">
            <path d="M-4 0 L4 0 M0 -4 L0 4" stroke="#1DB878" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
        <g transform="translate(5, 5)">
          <g className="plus-3">
            <path d="M-4.5 0 L4.5 0 M0 -4.5 L0 4.5" stroke="#AEEAA5" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>

      </svg>
    </div>
  );
}
