import { Titillium_Web, Inter } from "next/font/google";
import localFont from "next/font/local";

export const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-titillium",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const customFont = localFont({
  src: "../fonts/MyCustomFont.woff2", 
  variable: "--font-custom",
  display: "swap",
});
