import type { Metadata } from "next";
import "../globals.css"; // Ensure Tailwind stays loaded for Admin

export const metadata: Metadata = {
  title: "Admin Panel | SNP Store",
  description: "Secure Store Management System",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 h-screen w-screen m-0 p-0 overflow-hidden text-gray-900">
        {children}
      </body>
    </html>
  );
}
