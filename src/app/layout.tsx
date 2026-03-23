import type { Metadata, Viewport } from "next";
import { Titillium_Web, Inter } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { ToastProvider } from '@/components/ui/ToastProvider';
import Footer from '@/components/layout/footer';
import ViewportManager from '@/components/layout/ViewPortManager';

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "900"],
  variable: "--font-titillium",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const customFont = localFont({
  src: "../fonts/MyCustomFont.woff2", 
  variable: "--font-custom",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SNP Store | Premium Supplements",
  description: "High-performance supplements for your health.",
};

export const viewport: Viewport = {
  width: 410,
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="en" 
      // This tells React to ignore minor attribute mismatches caused by extensions
      suppressHydrationWarning
      className={`${titillium.variable} ${inter.variable} ${customFont.variable} antialiased initial-loading`}
    >
      <body className="bg-white font-titillium min-h-screen flex flex-col overflow-x-hidden">
        <Suspense fallback={null}>
          <ViewportManager />
        </Suspense>

        <ToastProvider>
          <main className="flex-grow flex flex-col w-full relative">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}