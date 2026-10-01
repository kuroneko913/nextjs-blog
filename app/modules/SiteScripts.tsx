"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function SiteScripts() {
  const pathname = usePathname();
  // Do not load third-party scripts alongside unpublished drafts or login keys.
  if (pathname === "/notes" || pathname.startsWith("/notes/")) return null;
  return <>
    <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3191328913162172" crossOrigin="anonymous" strategy="lazyOnload" />
    <GoogleAnalytics gaId="G-0SJ770PTHM" />
  </>;
}
