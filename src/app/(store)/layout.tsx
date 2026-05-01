import type { Metadata } from "next";
import "../globals.css";
import { Suspense } from "react";
import { ToastProvider } from '@/components/ui/ToastProvider';
import { AuthModalProvider } from '@/context/AuthModalContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import LoginModal from '@/components/auth/LoginModal';
import { titillium, inter, customFont } from "@/lib/fonts";
import ConditionalLayoutElements from "@/components/layout/ConditionalLayoutElements";
import { getSeoGlobal } from '@/lib/seo/getSeoData';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import OrganizationJsonLd from '@/components/seo/OrganizationJsonLd';
import Script from 'next/script';

export async function generateMetadata(): Promise<Metadata> {
  const gSeo = await getSeoGlobal();
  return {
    metadataBase: new URL('https://brightsupplements.store'),
    title: {
      default: gSeo?.default_title || 'Supplyment Nepal | Buy Authentic Supplements Online in Nepal',
      template: gSeo?.title_template || '%s | Supplyment Nepal',
    },
    description: gSeo?.default_description || "Nepal's most trusted supplement store. Buy 100% genuine whey protein, mass gainer, creatine & vitamins with fast delivery.",
    keywords: gSeo?.default_title
      ? undefined
      : 'buy supplements online nepal, best supplement store nepal, authentic whey protein nepal, protein powder price nepal, gym supplements nepal, mass gainer nepal, creatine nepal',
    robots: gSeo?.default_robots || 'index, follow',
    openGraph: {
      type: 'website',
      locale: 'en_NP',
      siteName: 'Supplyment Nepal',
      images: [
        {
          url: gSeo?.default_og_image || '/images/shoplogo.png',
          width: 1200,
          height: 630,
          alt: 'Supplyment Nepal — Buy Authentic Supplements in Nepal',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@supplymentnepal',
    },
    alternates: {
      canonical: 'https://brightsupplements.store',
      languages: { 'en-NP': 'https://brightsupplements.store' },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
        { url: '/images/shoplogo.png', sizes: '32x32', type: 'image/png' },
        { url: '/images/shoplogo.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [
        { url: '/images/shoplogo.png', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
    },
    manifest: '/site.webmanifest',
    other: {
      'geo.region': 'NP',
      'geo.placename': 'Kathmandu, Nepal',
      'geo.position': '27.7172;85.3240',
      'ICBM': '27.7172, 85.3240',
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${titillium.variable} ${inter.variable} ${customFont.variable} antialiased initial-loading`}
    >
      <head>
        <Script
          id="viewport-scaler-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var designWidth = 410;
                  function setViewport() {
                    var w = window.screen.width;
                    var content = w < designWidth 
                      ? 'width=' + designWidth + ', initial-scale=' + (w/designWidth) + ', maximum-scale=' + (w/designWidth) + ', user-scalable=no'
                      : 'width=device-width, initial-scale=1';
                    
                    var meta = document.querySelector('meta[name="viewport"]');
                    if (!meta) {
                      meta = document.createElement('meta');
                      meta.name = 'viewport';
                      meta.id = 'manual-viewport';
                      document.head.appendChild(meta);
                    }
                    meta.content = content;
                  }
                  setViewport();
                  
                  // Reveal Safety Timeout: Ensure site shows even if observer fails
                  var revealTimeout = setTimeout(function() {
                    document.documentElement.classList.add('viewport-ready');
                    document.documentElement.classList.remove('initial-loading');
                  }, 2000);

                  var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      mutation.addedNodes.forEach(function(node) {
                        if (node.name === 'viewport') { 
                          setViewport();
                          clearTimeout(revealTimeout);
                          document.documentElement.classList.add('viewport-ready');
                          document.documentElement.classList.remove('initial-loading');
                        }
                      });
                    });
                  });
                  observer.observe(document.head, { childList: true });
                  
                  // Initial reveal if script gets this far
                  document.documentElement.classList.add('viewport-ready');
                  document.documentElement.classList.remove('initial-loading');
                  clearTimeout(revealTimeout);
                } catch (e) {
                  console.error('Viewport script error:', e);
                  document.documentElement.classList.remove('initial-loading');
                  document.documentElement.classList.add('viewport-ready');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white font-titillium min-h-screen flex flex-col overflow-x-hidden">
        {/* Organization + WebSite JSON-LD — global structured data for Google */}
        <OrganizationJsonLd />

        {/* Google Analytics 4 — SPA-tracking enabled */}
        <GoogleAnalytics />

        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <AuthModalProvider>

                {children}

                <ConditionalLayoutElements />
                <LoginModal key="global-login-modal" />

              </AuthModalProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}