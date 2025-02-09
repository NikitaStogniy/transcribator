/** @type {import('next').NextConfig} */
const nextConfig = {
  // Разрешаем загрузку больших файлов
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  // Настраиваем обработку статических файлов
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/public/uploads/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
