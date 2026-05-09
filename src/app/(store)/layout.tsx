import type { Metadata } from "next";
import "../globals.css"; // Trigger build
import { Suspense } from "react";
import { ToastProvider } from '@/components/ui/ToastProvider';
import { AuthModalProvider } from '@/context/AuthModalContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { titillium, inter, customFont } from "@/lib/fonts";
import ConditionalLayoutElements from "@/components/layout/ConditionalLayoutElements";
import { getSeoGlobal } from '@/lib/seo/getSeoData';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import OrganizationJsonLd from '@/components/seo/OrganizationJsonLd';
import Script from 'next/script';
import LazyLoginModal from '@/components/auth/LazyLoginModal';

export async function generateMetadata(): Promise<Metadata> {
  const gSeo = await getSeoGlobal();
  return {
    metadataBase: new URL('https://www.brightsupplements.store'),
    title: {
      default: gSeo?.default_title || 'Supplyment Nepal | Buy Authentic Whey Protein, Creatine & MuscleBlaze in Nepal',
      template: gSeo?.title_template || '%s | Supplyment Nepal',
    },
    description: gSeo?.default_description || "Nepal's trusted supplement store. Buy 100% genuine Whey Protein, Creatine Monohydrate, MuscleBlaze, and Naturaltein with fast delivery in Nepal. Best prices for gym supplements and sports nutrition.",
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
          url: gSeo?.default_og_image || '/icon.png',
          width: 1200,
          height: 1200,
          alt: 'Supplyment Nepal — Buy Authentic Supplements in Nepal',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@supplymentnepal',
    },
    alternates: {
      canonical: 'https://www.brightsupplements.store',
      languages: { 'en-NP': 'https://www.brightsupplements.store' },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
        { url: '/icon.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
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
        {/* DNS prefetch + preconnect — eliminates DNS lookup latency for external resources */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        {/* Preconnect Supabase — eliminates DNS+TLS latency for client auth check */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL!} crossOrigin="anonymous" />
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
                  
                  var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      mutation.addedNodes.forEach(function(node) {
                        if (node.name === 'viewport') { 
                          setViewport();
                        }
                      });
                    });
                  });
                  observer.observe(document.head, { childList: true });
                } catch (e) {
                  console.error('Viewport script error:', e);
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
                <LazyLoginModal />

              </AuthModalProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
