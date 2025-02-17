"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Произошла ошибка на сервере. Пожалуйста, свяжитесь с администратором.";
      case "AccessDenied":
        return "Доступ запрещен. У вас нет прав для входа.";
      case "Verification":
        return "Ссылка для входа недействительна или истекла. Пожалуйста, запросите новую ссылку.";
      default:
        return "Произошла ошибка при попытке входа. Пожалуйста, попробуйте снова.";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="flex flex-col items-center space-y-8 text-center max-w-md px-4">
        <h1 className="text-4xl font-bold text-red-600">
          Ошибка аутентификации
        </h1>
        <p className="text-xl text-gray-600">{getErrorMessage(error)}</p>
        <a
          href="/auth/signin"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Вернуться на страницу входа
        </a>
      </div>
    </div>
  );
}
