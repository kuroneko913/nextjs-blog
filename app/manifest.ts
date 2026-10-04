import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "くろねこ。の実験室",
    short_name: "くろねこ。",
    description: "自由気ままに書くブログサイト",
    start_url: "/",
    id: "/",
    scope: "/",
    shortcuts: [
      { name: "実験メモを書く", short_name: "メモを書く", url: "/notes/new", description: "試したことをひとこと残す" },
      { name: "実験メモを読む", short_name: "実験メモ", url: "/notes" },
    ],
    display: "standalone",
    background_color: "#f6f5f0",
    theme_color: "#f6f5f0",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
