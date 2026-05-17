'use client';

// Viewport scaling is now handled entirely by:
// 1. `export const viewport` in layout.tsx (server-rendered, zero JS)
// 2. A single inline <script> in layout.tsx (runs once before first paint)
// No observers. No listeners. No client components needed.

export default function ViewportManager() {
  return null;
}
