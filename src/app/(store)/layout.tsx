import type { Metadata } from "next";
import "../globals.css"; // Trigger build
import { Suspense } from "react";
import { ToastProvider } from '@/components/ui/ToastProvider';
import { AuthModalProvider } from '@/context/AuthModalContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { rajdhani, inter, customFont, barlow } from "@/lib/fonts";
import ConditionalLayoutElements from "@/components/layout/ConditionalLayoutElements";
import { getSeoGlobal } from '@/lib/seo/getSeoData';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import OrganizationJsonLd from '@/components/seo/OrganizationJsonLd';
import LazyLoginModal from '@/components/auth/LazyLoginModal';
import NextTopLoader from 'nextjs-toploader';
import HomeSplashLoader from '@/components/home/HomeSplashLoader';
import { getStoreSettingsAction } from '@/app/actions/settingsActions';
import StoreMaintenance from '@/components/store/StoreMaintenance';

export async function generateMetadata(): Promise<Metadata> {
  const gSeo = await getSeoGlobal();
  return {
    metadataBase: new URL('https://www.brightsupplements.store'),
    applicationName: 'Supplyment Nepal',
    appleWebApp: {
      title: 'Supplyment Nepal',
      statusBarStyle: 'default',
    },
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settingsResult = await getStoreSettingsAction();
  const storeSettings = settingsResult.data || {};
  const isLive = storeSettings.is_live !== false;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rajdhani.variable} ${inter.variable} ${customFont.variable} ${barlow.variable} antialiased`}
    >
      <head>
        <meta name="facebook-domain-verification" content="7ishqpnop66zzwgrcpe0m7l77iqkbc" />
        {/* DNS prefetch — eliminates DNS lookup latency for external resources without expensive TLS handshakes */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Preconnect Supabase — critical for image loading and auth */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL!} crossOrigin="anonymous" />
        {/* Viewport scaling & iOS anti-zoom lockdown — Mobile shrinks the 410px layout to fit and blocks Safari gestures */}
        <script
          id="viewport-scaler"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var d = 410;
                var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
                var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || isIOS;
                var targetContent = '';
                var isEnforcing = false;

                function calculateViewport() {
                  var isLandscape = false;
                  if (typeof window.orientation !== 'undefined') {
                    isLandscape = Math.abs(window.orientation) === 90;
                  } else if (window.screen && window.screen.orientation && window.screen.orientation.type) {
                    isLandscape = window.screen.orientation.type.indexOf('landscape') !== -1;
                  }

                  var w = window.innerWidth || (window.screen && window.screen.width) || 0;
                  if (isMobile) {
                    var screenNarrow = Math.min(
                      (window.screen && window.screen.width) || window.innerWidth,
                      (window.screen && window.screen.height) || window.innerHeight
                    );
                    w = isLandscape ? Math.max(window.screen.width, window.screen.height) : screenNarrow;
                  }

                  if (isIOS) {
                    // iOS WebKit does not support fixed-width viewport scaling and resets scale to 1.0 on search/SPA navigation.
                    // Standard device-width on iOS eliminates all horizontal sliding and keeps the layout perfectly fitted to 100% of the screen.
                    targetContent = 'width=device-width, initial-scale=1, viewport-fit=cover';
                  } else if (isMobile && !isLandscape && w < d && w > 0) {
                    // Android Chrome fully supports user-scalable=no and fixed-width scaling.
                    var s = (w / d).toFixed(2);
                    targetContent = 'width=' + d + ', initial-scale=' + s + ', maximum-scale=' + s + ', minimum-scale=' + s + ', user-scalable=no, viewport-fit=cover';
                  } else {
                    targetContent = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
                  }
                }

                function enforceViewport() {
                  if (isEnforcing) return;
                  isEnforcing = true;
                  try {
                    var tags = document.querySelectorAll('meta[name="viewport"]');
                    if (tags.length === 0) {
                      var m = document.createElement('meta');
                      m.name = 'viewport';
                      m.content = targetContent;
                      document.head.appendChild(m);
                    } else {
                      for (var i = 0; i < tags.length; i++) {
                        if (tags[i].content !== targetContent) {
                          tags[i].content = targetContent;
                        }
                      }
                    }
                  } finally {
                    isEnforcing = false;
                  }
                }

                calculateViewport();
                enforceViewport();
                
                window.addEventListener('orientationchange', function(){ 
                  setTimeout(function() {
                    calculateViewport();
                    enforceViewport();
                  }, 100); 
                });

                var obs = new MutationObserver(function() {
                  enforceViewport();
                });
                obs.observe(document.head, { childList: true, attributes: true, attributeFilter: ['content'] });

                // iOS Safari Gesture Lockdown: Block pinch-to-zoom (WebKit gesture events only)
                document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
                document.addEventListener('gesturechange', function(e) { e.preventDefault(); });
                document.addEventListener('gestureend', function(e) { e.preventDefault(); });

                // Reset iOS visual viewport alignment when keyboard closes
                document.addEventListener('focusout', function(e) {
                  var t = e.target;
                  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) {
                    window.scrollTo(0, window.pageYOffset);
                  }
                });
              })();
            `
          }}
        ></script>
        {/* Anti-Flash Splash Screen Script */}
        <script
          id="splash-check"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('hasSeenSplash') === 'true') {
                  document.documentElement.classList.add('hide-splash');
                }
              } catch(e) {}
            `
          }}
        />
      </head>
      <body className="bg-white font-rajdhani font-medium min-h-screen flex flex-col overflow-x-clip">
        <NextTopLoader 
          color="#308026" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={false} 
          easing="ease" 
          speed={200} 
          shadow="none" 
        />
        
        {/* Instant Splash Loader (client-side checks pathname === '/') */}
        <HomeSplashLoader />

        {/* Organization + WebSite JSON-LD — global structured data for Google */}
        <OrganizationJsonLd />

        {/* Google Analytics 4 — SPA-tracking enabled */}
        <GoogleAnalytics />

        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <AuthModalProvider>

                {isLive ? (
                  <>
                    {children}
                    <ConditionalLayoutElements />
                    <LazyLoginModal />
                  </>
                ) : (
                  <StoreMaintenance message={storeSettings.maintenance_message} />
                )}

              </AuthModalProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
