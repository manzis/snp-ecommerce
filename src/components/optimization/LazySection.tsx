'use client';

import React, { useRef, useState, useEffect, startTransition, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** Minimum height for the placeholder to prevent layout shift */
  minHeight?: string;
  /** IntersectionObserver rootMargin — how far ahead to start loading */
  rootMargin?: string;
  /** Optional className for the wrapper */
  className?: string;
  /** Optional ID for the section */
  id?: string;
}

/**
 * LazySection — Defers rendering of below-the-fold sections until they
 * are near the viewport. Uses IntersectionObserver for zero-cost idle state
 * and startTransition for non-blocking hydration.
 *
 * This is the #1 performance lever for pages with many heavy sections.
 */
const LazySection: React.FC<LazySectionProps> = ({
  children,
  minHeight = '200px',
  rootMargin = '800px',
  className = '',
  id,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver is not supported (very old browsers), render immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Use startTransition so this doesn't block user interactions
          startTransition(() => {
            setIsVisible(true);
          });
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={
        !isVisible
          ? {
            minHeight,
          }
          : undefined
      }
    >
      {isVisible ? children : null}
    </div>
  );
};

export default LazySection;
