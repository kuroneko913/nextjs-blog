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
  verification: {
    google: "ChlpdBy_k7fv6vJPBEIcVrALoANld5sNqdHa2hBAo10"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link 
          rel="alternate"
          type="application/rss+xml"
          title="RSSフィード - くろねこ。の実験室"
          href="/blog/feed.xml"
        />
      </head>
      <body className={inter.className}>{children}</body>
      <GoogleAnalytics gaId="G-0SJ770PTHM" />
    </html>
  );
}
