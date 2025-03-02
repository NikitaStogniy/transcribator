import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { serverLogin, serverGoogleLogin } from "@/app/auth-actions";

// Схема валидации для логина
export const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Схема валидации для регистрации
export const registerSchema = z
  .object({
    name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
    email: z.string().email("Неверный формат email"),
    password: z
      .string()
      .min(8, "Пароль должен содержать минимум 8 символов")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли должны совпадать",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Хук аутентификации с поддержкой React Query
export const useAuth = () => {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  // Мутация для регистрации
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка регистрации");
      }

      return await response.json();
    },
    onSuccess: async (data, variables) => {
      toast.success("Регистрация успешна! Выполняется вход...");

      try {
        // Получаем текущую локаль из URL
        const pathSegments = window.location.pathname.split("/");
        const locale = pathSegments.length > 1 ? pathSegments[1] : "en";
        const dashboardPath = `/${locale}/dashboard`;

        // Выполняем вход после регистрации
        const result = await serverLogin(
          {
            email: variables.email,
            password: variables.password,
          },
          dashboardPath
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        // Перенаправляем на дашборд
        window.location.href = dashboardPath;
      } catch (error) {
        toast.error(
          "Произошла ошибка при входе. Вы будете перенаправлены на страницу входа."
        );
        router.push("/auth/login");
      }
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Ошибка регистрации. Пожалуйста, попробуйте еще раз."
      );
    },
  });

  // Функция для входа через email/пароль
  const login = async (credentials: LoginFormData) => {
    setIsLoggingIn(true);

    try {
      // Получаем текущую локаль из URL
      const pathSegments = window.location.pathname.split("/");
      const locale = pathSegments.length > 1 ? pathSegments[1] : "en";
      const dashboardPath = `/${locale}/dashboard`;

      // Используем серверное действие для входа
      const result = await serverLogin(credentials, dashboardPath);

      if (!result.success) {
        toast.error(result.error || "Ошибка входа. Проверьте ваши данные.");
        setIsLoggingIn(false);
        return false;
      }

      toast.success("Вход выполнен успешно!");

      // Перенаправляем пользователя на дашборд
      setTimeout(() => {
        window.location.href = dashboardPath;
      }, 500);

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Произошла ошибка при входе";

      toast.error(errorMessage);
      setIsLoggingIn(false);
      return false;
    }
  };

  // Функция для входа через Google
  const googleLogin = async () => {
    setIsGoogleLoggingIn(true);

    try {
      // Получаем текущую локаль из URL
      const pathSegments = window.location.pathname.split("/");
      const locale = pathSegments.length > 1 ? pathSegments[1] : "en";
      const dashboardPath = `/${locale}/dashboard`;

      // Используем серверное действие для входа через Google
      await serverGoogleLogin(dashboardPath);
      return true;
    } catch (error) {
      toast.error("Произошла ошибка при входе через Google");
      setIsGoogleLoggingIn(false);
      return false;
    }
  };

  return {
    login,
    googleLogin,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn,
    isGoogleLoggingIn,
    isLoading: isLoggingIn || isGoogleLoggingIn || registerMutation.isPending,
  };
};
