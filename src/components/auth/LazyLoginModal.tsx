'use client';

import dynamic from 'next/dynamic';

// Lazy-load LoginModal — it's hidden by default, only shown when user triggers login
const LoginModal = dynamic(() => import('@/components/auth/LoginModal'), { ssr: false });

/**
 * Client-side wrapper for LoginModal to enable dynamic import with ssr: false.
 * This defers ~28KB of JS + framer-motion animations from the initial bundle.
 */
export default function LazyLoginModal() {
  return <LoginModal key="global-login-modal" />;
}
