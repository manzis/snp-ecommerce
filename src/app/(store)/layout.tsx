import type { Metadata } from "next";
import "../globals.css";
import { Suspense } from "react";
import { ToastProvider } from '@/components/ui/ToastProvider';
import { AuthModalProvider } from '@/context/AuthModalContext'; // Import Provider
import { AuthProvider } from '@/context/AuthContext'; // Import new AuthProvider
import { CartProvider } from '@/context/CartContext';
import LoginModal from '@/components/auth/LoginModal'; // Import Component
import { titillium, inter, customFont } from "@/lib/fonts";
import ConditionalLayoutElements from "@/components/layout/ConditionalLayoutElements";
import { getSeoGlobal } from '@/lib/seo/getSeoData';

export async function generateMetadata(): Promise<Metadata> {
  const gSeo = await getSeoGlobal();
  return {
    title: {
      default: gSeo?.default_title || 'SNP Store | Premium Supplements Nepal',
      template: gSeo?.title_template || '%s | SNP Store',
    },
    description: gSeo?.default_description || 'Shop premium supplements at SNP Store Nepal.',
    robots: gSeo?.default_robots || 'index, follow',
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
        <script
          key="viewport-scaler-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
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
                      if (node.name === 'viewport') { setViewport(); }
                    });
                  });
                });
                observer.observe(document.head, { childList: true });
                document.documentElement.classList.add('viewport-ready');
                document.documentElement.classList.remove('initial-loading');
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white font-titillium min-h-screen flex flex-col overflow-x-hidden">
        <ToastProvider>
          {/* Global Auth & Cart Contexts wrapping the app */}
          <AuthProvider>
            <CartProvider>
              <AuthModalProvider>

                <main key="main-root-container" className="flex-grow flex flex-col w-full relative">
                  {children}
                </main>

                {/* Conditional Global UI Components (hides on login/signup) */}
                <ConditionalLayoutElements />

                {/* The Modal lives here at the bottom of the body */}
                <LoginModal key="global-login-modal" />

              </AuthModalProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}