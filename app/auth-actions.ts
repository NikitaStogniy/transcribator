"use server";

import { signIn } from "@/auth";
import { headers as nextHeaders } from "next/headers";

type LoginFormData = {
  email: string;
  password: string;
};

type AuthResult = {
  success: boolean;
  error?: string;
  url?: string;
};

// Серверное действие для входа в систему
export async function serverLogin(
  data: LoginFormData,
  redirectTo: string
): Promise<AuthResult> {
  try {
    // Формируем абсолютный URL для редиректа
    let callbackUrl = redirectTo;
    if (!callbackUrl.startsWith("http")) {
      const headersList = nextHeaders();
      const host = headersList.get("host") || "localhost:3000";
      const protocol = headersList.get("x-forwarded-proto") || "http";
      callbackUrl = `${protocol}://${host}${redirectTo}`;
    }

    // Вызываем NextAuth signIn
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl,
    });

    if (!result) {
      return {
        success: false,
        error: "Ошибка сервера аутентификации",
      };
    }

    if (result.error) {
      // Пользовательское сообщение для ошибки входа
      if (result.error === "CredentialsSignin") {
        return {
          success: false,
          error: "Неверный email или пароль. Пожалуйста, проверьте данные.",
        };
      }

      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      url: redirectTo,
    };
  } catch (error) {
    let errorMessage = "Произошла ошибка при входе";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Серверное действие для входа через Google
export async function serverGoogleLogin(
  redirectTo: string
): Promise<AuthResult> {
  try {
    await signIn("google", {
      redirectTo,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Произошла ошибка при входе через Google",
    };
  }
}
