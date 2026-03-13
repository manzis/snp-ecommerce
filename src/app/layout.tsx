import type { Metadata } from "next";
import { Titillium_Web, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from '@/components/ui/ToastProvider';
import Footer from '@/components/layout/footer'; // Import the Footer

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
  title: "SNP Store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="en" 
      className={`${titillium.variable} ${inter.variable} ${customFont.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var targetWidth = 410;
                var scale = window.screen.width / targetWidth;
                var meta = document.createElement('meta');
                meta.name = 'viewport';
                if (window.screen.width < targetWidth) {
                  meta.content = 'width=' + targetWidth + ', initial-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=no';
                } else {
                  meta.content = 'width=device-width, initial-scale=1';
                }
                document.getElementsByTagName('head')[0].appendChild(meta);
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-white font-titillium min-h-screen flex flex-col">
        <ToastProvider>
          {/* flex-grow ensures the page content fills space and pushes footer down */}
          <div className="flex-grow">
            {children}
          </div>
          
          {/* Global Footer appears on every page */}
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}