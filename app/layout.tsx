import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "くろねこ。の実験室",
  description: "自由気ままに書くブログサイト",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    title: "くろねこ。の実験室",
    description: "自由気ままに書くブログサイト",
    siteName: "くろねこ。の実験室",
    url: "https://myblackcat913.com",
    images: [
      {
        url: "https://myblackcat913.com/images/logo.webp",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
      <GoogleAnalytics gaId="G-0SJ770PTHM" />
    </html>
  );
}
