export function GET() {
  return Response.json({
    id: "/notes", name: "くろねこ。のNotes", short_name: "Notes",
    description: "試したことを、ひとこと残す。", lang: "ja",
    start_url: "/notes/new", scope: "/notes", display: "standalone",
    background_color: "#f6f5f0", theme_color: "#f6f5f0",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  }, { headers: { "Content-Type": "application/manifest+json" } });
}
