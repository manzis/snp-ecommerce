import { Titillium_Web, Inter, Inter_Tight, Rubik } from "next/font/google";
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

export const interTight = Inter_Tight({
    subsets: ["latin"],
    variable: "--font-inter-tight",
    display: "swap",
});

export const rubik = Rubik({
    subsets: ["latin"],
    variable: "--font-rubik",
    display: "swap",
});

export const customFont = localFont({
  src: "../fonts/MyCustomFont.woff2", 
  variable: "--font-custom",
  display: "swap",
});
