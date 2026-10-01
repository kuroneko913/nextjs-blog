/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] }];
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
