import React from 'react';

/**
 * MenuIcon (Back Arrow) Component
 * Preserves exact path coordinates from design.
 * Fixed for React DOM property requirements.
 */
export default function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      // Applying className here allows Tailwind classes like w-x, h-x, and text-x to work
      className={className}
    >
      <path
        d="M19.0001 12H6.00009M11.0001 6L5.7072 11.2929C5.31668 11.6834 5.31668 12.3166 5.7072 12.7071L11.0001 18"
        // Use "currentColor" so the text-[#242424] class on the parent works dynamically
        stroke="currentColor"
        // Fixed: stroke-width -> strokeWidth
        strokeWidth="2"
        // Fixed: stroke-linecap -> strokeLinecap
        strokeLinecap="round"
      />
    </svg>
  );
}
