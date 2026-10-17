"use client";

import React, { useEffect } from 'react';

export interface FlyToCartDetail {
  x?: number;
  y?: number;
  image?: string | null;
}

/**
 * Global trigger to fly an item into the top navigation cart button
 */
export function triggerFlyToCart(params?: FlyToCartDetail) {
  if (typeof window === 'undefined') return;
  (window as any).__lastFlyToCartTime = Date.now();
  window.dispatchEvent(new CustomEvent('flyToCart', { detail: params || {} }));
}

/**
 * FlyToCartAnimation component:
 * Spawns a smooth parabolic arc animation of the product thumbnail flying
 * from the clicked "Add to Cart" button into the top nav cart icon.
 */
export default function FlyToCartAnimation() {
  useEffect(() => {
    const handleFly = (e: Event) => {
      const customEvent = e as CustomEvent<FlyToCartDetail>;
      const detail = customEvent.detail || {};

      // Determine starting coordinates
      let startX = detail.x;
      let startY = detail.y;

      if (!startX || !startY) {
        // Fallback to active/inline button coordinates
        const inlineBtn = document.getElementById('inline-add-to-cart-btn') ||
                          document.getElementById('inline-cta-container')?.querySelector('button') ||
                          document.querySelector('button[aria-label="Add to cart"]');
        if (inlineBtn) {
          const rect = inlineBtn.getBoundingClientRect();
          startX = rect.left + rect.width / 2;
          startY = rect.top + rect.height / 2;
        } else {
          // Bottom center fallback
          startX = window.innerWidth / 2;
          startY = window.innerHeight - 80;
        }
      }

      // Determine target coordinates (top-nav-cart-btn)
      const targetEl = document.getElementById('top-nav-cart-btn') ||
                       document.querySelector('[aria-label="View cart"]');
      let targetX: number;
      let targetY: number;

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      } else {
        // Fallback to top-right corner where cart sits
        targetX = window.innerWidth - 42;
        targetY = 28;
      }

      // Resolve product image for flying avatar
      let productImgSrc = detail.image;
      if (!productImgSrc) {
        const mainImg = document.querySelector('img[alt*="view 1"]') as HTMLImageElement ||
                        document.querySelector('main img') as HTMLImageElement;
        if (mainImg?.src) {
          productImgSrc = mainImg.src;
        }
      }

      // Create animated floating element
      const flyEl = document.createElement('div');
      flyEl.setAttribute('aria-hidden', 'true');
      flyEl.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 50px;
        height: 50px;
        border-radius: 9999px;
        background: #ffffff;
        box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.22), 0 4px 8px -2px rgba(0, 0, 0, 0.12);
        border: 2px solid #318126;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        pointer-events: none;
        z-index: 999999;
        will-change: transform, opacity;
      `;

      if (productImgSrc) {
        const img = document.createElement('img');
        img.src = productImgSrc;
        img.alt = '';
        img.style.cssText = 'width: 82%; height: 82%; object-fit: contain; pointer-events: none;';
        flyEl.appendChild(img);
      } else {
        flyEl.innerHTML = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#318126" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2h12v4H6z"/>
            <rect x="4" y="6" width="16" height="16" rx="2"/>
            <path d="M10 12h4M12 10v4"/>
          </svg>
        `;
      }

      document.body.appendChild(flyEl);

      const deltaX = targetX - startX;
      const deltaY = targetY - startY;

      // Parabolic arc peak: element travels upwards before plummeting into cart
      const arcHeight = Math.min(-70, deltaY * 0.3 - 75);

      const keyframes = [
        {
          transform: `translate3d(${startX - 25}px, ${startY - 25}px, 0) scale(1) rotate(0deg)`,
          opacity: 1
        },
        {
          transform: `translate3d(${startX + deltaX * 0.3 - 25}px, ${startY + deltaY * 0.15 + arcHeight - 25}px, 0) scale(1.06) rotate(-10deg)`,
          opacity: 1,
          offset: 0.3
        },
        {
          transform: `translate3d(${startX + deltaX * 0.68 - 25}px, ${startY + deltaY * 0.55 + arcHeight * 0.45 - 25}px, 0) scale(0.62) rotate(12deg)`,
          opacity: 0.95,
          offset: 0.68
        },
        {
          transform: `translate3d(${targetX - 25}px, ${targetY - 25}px, 0) scale(0.12) rotate(20deg)`,
          opacity: 0.1
        }
      ];

      const animation = flyEl.animate(keyframes, {
        duration: 1150,
        easing: 'cubic-bezier(0.25, 0.9, 0.35, 1)',
        fill: 'forwards'
      });

      animation.onfinish = () => {
        flyEl.remove();
        window.dispatchEvent(new CustomEvent('cartBump'));
      };
    };

    window.addEventListener('flyToCart', handleFly);
    return () => window.removeEventListener('flyToCart', handleFly);
  }, []);

  return null;
}
