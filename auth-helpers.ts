/**
 * Этот файл содержит серверные хелперы для аутентификации
 * и будет импортироваться только на сервере.
 */

import { compare, hash } from "bcryptjs";

// Экспортируем функции хеширования и проверки паролей
export const passwordUtils = {
  /**
   * Хеширует пароль с использованием bcryptjs
   */
  hashPassword: async (password: string): Promise<string> => {
    if (typeof password !== "string") {
      throw new Error("Пароль должен быть строкой");
    }

    if (!password || password.trim() === "") {
      throw new Error("Пароль не может быть пустым");
    }

    try {
      return await hash(password, 10);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Проверяет, соответствует ли пароль хешу
   */
  verifyPassword: async (
    password: string,
    hashedPassword: string
  ): Promise<boolean> => {
    if (typeof password !== "string") {
      throw new Error("Пароль должен быть строкой");
    }

    if (typeof hashedPassword !== "string") {
      throw new Error("Хеш пароля должен быть строкой");
    }

    if (
      !password ||
      password.trim() === "" ||
      !hashedPassword ||
      hashedPassword.trim() === ""
    ) {
      return false;
    }

    try {
      return await compare(password, hashedPassword);
    } catch (error) {
      return false;
    }
  },
};

// Флаг, указывающий что модуль успешно загружен
export const isAuthHelpersAvailable = true;
