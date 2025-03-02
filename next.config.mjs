import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Используем правильную опцию для внешних пакетов
  experimental: {
    serverComponentsExternalPackages: [
      "bcrypt",
      "@mapbox/node-pre-gyp",
      "fs.realpath",
      "@prisma/client",
      ".prisma/client",
      "prisma",
    ],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Отключаем бандлинг нативных модулей
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Исключаем нативные модули из серверного бандла
      config.externals.push("fs", "path", "crypto");
    } else {
      // Предоставляем пустые полифиллы для браузера
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        module: false,
        dns: false,
        net: false,
        tls: false,
        child_process: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
        util: false,
        async_hooks: false,
        punycode: false,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
