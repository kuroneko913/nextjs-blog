/** @type {import('next').NextConfig} */
const nextConfig = {
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
