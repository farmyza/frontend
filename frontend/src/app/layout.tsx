import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import { Navbar } from "@/components/layout/Navbar";
import { UserAuthModal } from "@/components/auth/UserAuthModal";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Farmyza | Decision-Support Engine for Crop Rotation",
  description:
    "AI & NASA Satellite Data Driven Crop Rotation Decision-Support System for resilient and profitable farming in Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <UserProvider>
          <Navbar />
          <UserAuthModal />
          <main className="flex-1">{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
