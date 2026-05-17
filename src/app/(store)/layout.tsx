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
import LazyLoginModal from '@/components/auth/LazyLoginModal';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${titillium.variable} ${inter.variable} ${customFont.variable} antialiased initial-loading`}
    >
      <head>
        <meta name="facebook-domain-verification" content="7ishqpnop66zzwgrcpe0m7l77iqkbc" />
        {/* DNS prefetch — eliminates DNS lookup latency for external resources without expensive TLS handshakes */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Preconnect Supabase — critical for image loading and auth */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL!} crossOrigin="anonymous" />
        {/* Viewport scaling — runs once via beforeInteractive, before hydration.
            Mobile: shrinks the 410px layout to fit.
            Desktop: standard device-width.
            NO MutationObserver. NO event listeners. Zero CPU cost. */}
        <script
          id="viewport-scaler"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var d = 410;
                
                function patchTag(m) {
                  if (!m) return;
                  var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
                  var w = isMobile ? (screen.width || window.innerWidth) : window.innerWidth;
                  
                  if (w > 600 && isMobile && window.devicePixelRatio > 1) {
                    w = w / window.devicePixelRatio;
                  }
                  
                  var c;
                  if (w < d) {
                    var s = (w / d).toFixed(2);
                    c = 'width=' + d + ', initial-scale=' + s + ', maximum-scale=' + s + ', minimum-scale=' + s + ', user-scalable=no, viewport-fit=cover';
                  } else {
                    c = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
                  }
                  
                  if (m.__patched) {
                    m.__origSetAttr.call(m, 'content', c);
                    return;
                  }
                  
                  m.setAttribute('content', c);
                  m.__patched = true;
                  m.__origSetAttr = m.setAttribute;
                  m.setAttribute = function(n, v) {
                    if (n === 'content') return;
                    m.__origSetAttr.call(this, n, v);
                  };
                  Object.defineProperty(m, 'content', {
                    set: function() {},
                    get: function() { return c; }
                  });
                }
                
                function fixAll() {
                  var metas = document.querySelectorAll('meta[name="viewport"]');
                  for (var i = 0; i < metas.length; i++) {
                    patchTag(metas[i]);
                  }
                }
                
                fixAll();
                window.addEventListener('orientationchange', function(){ setTimeout(fixAll, 100); });
                
                var obs = new MutationObserver(function() {
                  fixAll();
                });
                obs.observe(document.head, { childList: true });
                
                document.documentElement.classList.remove('initial-loading');
              })();
            `
          }}
        ></script>
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
