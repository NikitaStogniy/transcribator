import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PrismaClient, Prisma } from "@prisma/client";

// Схема валидации для регистрации
const registerSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Проверяем входные данные
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await hash(password, 10);

    // Создаем пользователя и его персональную команду в одной транзакции
    const { user, team } = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Создаем пользователя
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });

        // 2. Создаем персональную команду для пользователя
        const teamName = `${name}'s Team`;
        const newTeam = await tx.team.create({
          data: {
            name: teamName,
            description: `Personal team for ${name}`,
            // 3. Добавляем пользователя как администратора команды
            members: {
              create: {
                userId: newUser.id,
                role: "admin",
              },
            },
          },
          include: {
            members: true,
          },
        });

        return { user: newUser, team: newTeam };
      }
    );

    // Возвращаем пользователя без пароля и информацию о команде
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        team: {
          id: team.id,
          name: team.name,
        },
        message: "Пользователь успешно зарегистрирован с персональной командой",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Не удалось зарегистрировать пользователя" },
      { status: 500 }
    );
  }
}
