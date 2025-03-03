import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Метод для получения команд текущего пользователя
export async function GET() {
  try {
    // Получаем данные текущего пользователя из сессии
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Получаем список команд пользователя из базы данных
    const userTeams = await db.team.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc", // Сначала самые новые
      },
    });

    // Если у пользователя нет команд, создаем автоматически личную команду
    if (userTeams.length === 0) {
      const newTeam = await db.team.create({
        data: {
          name: "Моя команда",
          description: "Личная команда",
          members: {
            create: {
              userId: session.user.id,
              role: "admin",
            },
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ teams: [newTeam] });
    }

    // Возвращаем список команд пользователя
    return NextResponse.json({ teams: userTeams });
  } catch (error) {
    console.error("Error fetching user teams:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
