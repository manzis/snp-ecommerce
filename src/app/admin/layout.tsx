import type { Metadata } from "next";
import "../globals.css"; // Ensure Tailwind stays loaded for Admin

import { inter, interTight, barlow, rubik, customFont } from "@/lib/fonts";
import { AdminToastProvider } from "@/components/admin/ui/AdminToastProvider";
import { AdminUIProvider } from "@/context/AdminUIContext";

export const metadata: Metadata = {
  title: "Admin Panel | SNP Store",
  description: "Secure Store Management System",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${interTight.variable} ${barlow.variable} ${rubik.variable} ${customFont.variable} antialiased bg-gray-50 h-[100dvh] w-screen m-0 p-0 overflow-hidden text-gray-900 selection:bg-black selection:text-white`}>
        <AdminUIProvider>
          <AdminToastProvider>
            {children}
          </AdminToastProvider>
        </AdminUIProvider>
      </body>
    </html>
  );
}
