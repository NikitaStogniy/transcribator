import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Базовая конфигурация, совместимая с Edge Runtime (для middleware)
export const authConfig: NextAuthConfig = {
  // Страницы
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  // Провайдеры (без логики авторизации для Edge)
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Пустая заглушка (реальная логика будет в auth.ts)
      async authorize() {
        return null;
      },
    }),
  ],

  // Колбэки
  callbacks: {
    // Обработка перенаправлений
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl) || url.startsWith("/")) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },

    // Проверка авторизации для middleware
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;

      // Публичные пути, которые не требуют аутентификации
      const PUBLIC_PATHS = [
        "/auth/login",
        "/auth/register",
        "/auth/error",
        "/",
        "/blog",
        "/pricing",
        "/features",
        "/test-login",
      ];

      const isPublicPath = PUBLIC_PATHS.some(
        (pp) => path.startsWith(pp) || path.endsWith(pp)
      );

      // API пути проверяются отдельно
      if (path.startsWith("/api/")) {
        return true;
      }

      // Не требуем авторизации для публичных путей
      if (isPublicPath) {
        return true;
      }

      // Для всех остальных путей требуем авторизацию
      return isLoggedIn;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Важные настройки безопасности
  trustHost: true,
};
