import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

// Расширяем базовую конфигурацию, добавляя Prisma и серверную логику
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // Используем базовую конфигурацию

  // Добавляем Prisma адаптер
  adapter: PrismaAdapter(prisma),

  // Добавляем расширенные колбэки с серверной логикой
  callbacks: {
    // Используем базовые колбэки
    ...authConfig.callbacks,

    // Дополнительно добавляем JWT колбэк
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },

    // И колбэк для сессии
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },

  // Переопределяем провайдеры, добавляя логику авторизации
  providers: [
    // Используем Google провайдер из базовой конфигурации
    authConfig.providers[0],

    // Переопределяем Credentials провайдер с реальной логикой
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Ищем пользователя
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          // Проверяем пароль через bcryptjs
          const isValid = await compare(
            String(credentials.password),
            user.password
          );

          if (!isValid) {
            return null;
          }

          // Возвращаем данные пользователя без пароля
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],

  // Включаем дебаг только в режиме разработки
  debug: process.env.NODE_ENV === "development",
});
