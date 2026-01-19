import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SyncProvider } from "@/components/SyncProvider";
import { ServiceWorkerProvider } from "@/components/ServiceWorkerProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "家庭积分管理系统",
  description: "记录家庭成员的积分变化",
  manifest: "/point-card/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "积分卡",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/point-card/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/point-card/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/point-card/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/point-card/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/point-card/icons/icon-152x152.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="积分卡" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerProvider>
          <SyncProvider>{children}</SyncProvider>
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
