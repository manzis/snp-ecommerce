import { Rajdhani, Inter, Inter_Tight, Rubik, Barlow } from "next/font/google";
import localFont from "next/font/local";

export const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
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

export const barlow = Barlow({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    variable: "--font-barlow",
    display: "swap",
});

export const customFont = localFont({
  src: "../fonts/MyCustomFont.woff2", 
  variable: "--font-custom",
  display: "swap",
});
