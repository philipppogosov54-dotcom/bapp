/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем Turbopack из-за permission denied ошибки на macOS
  experimental: {
    turbo: false,
  },
  
  // PWA конфигурация будет добавлена через next-pwa после установки
  // Для разработки пока работаем без service worker
  
  // Оптимизации для изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pcdn.goldapple.ru',
        pathname: '/p/p/**',
      },
      {
        protocol: 'https',
        hostname: 'goldapple.ru',
        pathname: '/**',
      },
    ],
  },
  
  // Добавляем headers для PWA
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
