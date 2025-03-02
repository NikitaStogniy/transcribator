import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

import createIntlMiddleware from "next-intl/middleware";
import { locales } from "./i18n/routing";

// Пути, доступные без аутентификации
const publicRoutes = ["/", "/auth/login", "/auth/register", "/test-login"];
// Пути аутентификации
const authRoutes = ["/auth/login", "/auth/register"];
// Префикс API роутов аутентификации
const apiAuthPrefix = "/api/auth";

// Создаем middleware для интернационализации
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});

// Инициализируем аутентификацию для middleware
const { auth } = NextAuth(authConfig);

// Функция проверки, является ли путь публичным
function isPublicPath(path: string): boolean {
  // Проверяем сначала API пути
  if (path.startsWith(apiAuthPrefix)) {
    return true;
  }

  // Удаляем локаль из пути если она есть (например /en/auth/login -> /auth/login)
  const pathWithoutLocale = locales.some((locale) =>
    path.startsWith(`/${locale}/`)
  )
    ? path.replace(/^\/[a-z]{2}\//, "/")
    : path;

  return publicRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(route)
  );
}

// Функция проверки, является ли путь маршрутом аутентификации
function isAuthPath(path: string): boolean {
  // Удаляем локаль из пути если она есть
  const pathWithoutLocale = locales.some((locale) =>
    path.startsWith(`/${locale}/`)
  )
    ? path.replace(/^\/[a-z]{2}\//, "/")
    : path;

  return authRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(route)
  );
}

// Оборачиваем nextAuth в наш кастомный middleware
export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // Проверяем статус аутентификации
  const isLoggedIn = !!req.auth;

  // Пропускаем статичные ресурсы
  if (
    [
      "/favicon.ico",
      "/_next/static",
      "/_next/image",
      "/images/",
      "/avatars/",
    ].some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // Если путь публичный, продолжаем
  if (isPublicPath(pathname)) {
    // Применяем интернационализацию
    return intlMiddleware(req);
  }

  // Если пользователь пытается зайти на страницу аутентификации, но уже залогинен
  if (isLoggedIn && isAuthPath(pathname)) {
    // Получим текущую локаль
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : "";
    const dashboardPath = locale ? `/${locale}/dashboard` : "/dashboard";

    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  // Если пользователь не залогинен и пытается получить доступ к защищенному пути
  if (!isLoggedIn && !isPublicPath(pathname)) {
    // Получим текущую локаль
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : "";
    const loginPath = locale ? `/${locale}/auth/login` : "/auth/login";

    // Добавляем callbackUrl для возврата после авторизации
    const callbackUrl = pathname + req.nextUrl.search;
    const loginWithCallback = new URL(
      `${loginPath}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      req.url
    );

    return NextResponse.redirect(loginWithCallback);
  }

  // Для остальных случаев (залогиненный пользователь на защищенном маршруте)
  // просто применяем интернационализацию
  return intlMiddleware(req);
});

export const config = {
  // Matcher для маршрутов, исключая статические файлы и API пути
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
