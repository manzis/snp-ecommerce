import type { Metadata } from "next";
import "../globals.css";
import { Suspense } from "react";
import { ToastProvider } from '@/components/ui/ToastProvider';
import HomeBottomNav from "@/components/home/HomeBottomNav";
import Footer from '@/components/layout/footer';
import { titillium, inter, customFont } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "SNP Store | Premium Supplements",
  description: "High-performance supplements for your health.",
};

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
          {/* 
              FIX: Added keys to the top-level Router children. 
              This prevents OuterLayoutRouter from losing the element identity 
              during page transitions.
          */}
          <main key="main-root-container" className="flex-grow flex flex-col w-full relative">
            {children}
          </main>

          <HomeBottomNav key="global-bottom-nav" />

          <Footer key="global-footer" />
        </ToastProvider>
      </body>
    </html>
  );
}