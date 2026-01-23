import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { ServiceWorkerRegister, OfflineIndicator } from "@/components/pwa";

export const metadata: Metadata = {
  title: "BeautyScore — Гиперперсонализированный подбор косметики",
  description: "Узнай, какая косметика подходит именно тебе. Персональная оценка каждого товара на основе твоего профиля.",
  keywords: ["косметика", "персональный подбор", "уход за кожей", "ингредиенты", "рекомендации"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BeautyScore",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2D7A4F", // BeautyScore accent green
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" 
          rel="stylesheet" 
        />
        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="192x192" href="/icons/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="512x512" href="/icons/icon-512.svg" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <OfflineIndicator />
            {children}
            <ServiceWorkerRegister />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
