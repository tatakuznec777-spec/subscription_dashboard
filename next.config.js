/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://gitverse.ru/semao0/mock_api_irg/:path*',
      },
    ];
  },
  // Отключаем строгую проверку типов при сборке (для скорости)
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;