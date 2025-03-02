// Проверяем, находимся ли мы на сервере
// process - это глобальный объект Node.js, доступный только на сервере
const isServer = typeof window === "undefined";

let prisma: any;

// Импортируем PrismaClient только на сервере
if (isServer) {
  const { PrismaClient } = require("@prisma/client");

  // PrismaClient прикрепляется к объекту `global` в режиме разработки
  // чтобы избежать исчерпания лимита соединений с базой данных.
  const globalForPrisma = global as unknown as { prisma: any };

  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} else {
  // На клиенте просто возвращаем пустой объект
  // Это предотвратит ошибки из-за попытки бандлить Prisma на клиенте
  prisma = {};
}

export { prisma };
