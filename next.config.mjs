/** @type {import('next').NextConfig} */
const nextConfig = {
  // Разрешаем доступ к dev-ресурсам Next.js при открытии с телефона по LAN.
  allowedDevOrigins: ['*'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      }
    ]
  }
};

export default nextConfig;
