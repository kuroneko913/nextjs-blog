/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: '/lab/toytoibox', destination: '/lab/ai-agent-operations', permanent: true }];
  },
  async headers() {
    return [
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
      { source: '/:path*', headers: [{ key: 'Content-Security-Policy', value: "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : "") + "; object-src 'none'; base-uri 'self'" }] },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.speakerdeck.com',
        port: '',
        pathname: '/presentations/**',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
