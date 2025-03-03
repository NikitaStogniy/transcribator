import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Определяем типы ролей и разрешений
export type Permission = {
  id: string;
  name: string;
  description: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
};

// Маппинг ролей пользователей из TeamMember.role
const ROLES = {
  admin: {
    id: "admin",
    name: "Администратор",
    description: "Полный доступ ко всем функциям и возможностям",
  },
  editor: {
    id: "editor",
    name: "Редактор",
    description: "Может редактировать и создавать контент",
  },
  viewer: {
    id: "viewer",
    name: "Пользователь",
    description: "Только просмотр контента",
  },
};

// Предопределенные разрешения для каждой роли
const PERMISSIONS = {
  admin: [
    {
      id: "files_manage",
      name: "Управление файлами",
      description: "Загрузка, удаление и управление файлами",
    },
    {
      id: "team_manage",
      name: "Управление командой",
      description: "Добавление и удаление участников команды",
    },
    {
      id: "docs_manage",
      name: "Управление документами",
      description: "Создание, редактирование и удаление документов",
    },
    {
      id: "settings_manage",
      name: "Управление настройками",
      description: "Изменение настроек системы",
    },
  ],
  editor: [
    {
      id: "files_upload",
      name: "Загрузка файлов",
      description: "Загрузка новых файлов",
    },
    {
      id: "docs_edit",
      name: "Редактирование документов",
      description: "Создание и редактирование документов",
    },
  ],
  viewer: [
    {
      id: "files_view",
      name: "Просмотр файлов",
      description: "Просмотр файлов",
    },
    {
      id: "docs_view",
      name: "Просмотр документов",
      description: "Просмотр документов",
    },
  ],
};

// GET-обработчик для получения всех разрешений
export async function GET(request: Request) {
  try {
    // Проверяем аутентификацию
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");

    if (roleId && ROLES[roleId as keyof typeof ROLES]) {
      // Получаем информацию о конкретной роли
      const role = ROLES[roleId as keyof typeof ROLES];
      const permissions = PERMISSIONS[roleId as keyof typeof PERMISSIONS] || [];

      // Форматируем ответ
      return NextResponse.json({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions,
      });
    }

    // Получаем все роли и разрешения
    const roles = Object.entries(ROLES).map(([id, role]) => ({
      id,
      name: role.name,
      description: role.description,
      permissions: PERMISSIONS[id as keyof typeof PERMISSIONS] || [],
    }));

    // Собираем все уникальные разрешения
    const allPermissions = Object.values(PERMISSIONS).flat();
    const uniquePermissions = [
      ...new Map(allPermissions.map((p) => [p.id, p])).values(),
    ];

    return NextResponse.json({
      permissions: uniquePermissions,
      roles,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

// Схема для обновления роли пользователя
const updateUserRoleSchema = z.object({
  userId: z.string(),
  teamId: z.string(),
  role: z.enum(["admin", "editor", "viewer"]),
});

// PATCH-обработчик для обновления роли пользователя
export async function PATCH(request: Request) {
  try {
    // Проверяем аутентификацию
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Разбираем тело запроса
    const body = await request.json();

    // Валидируем ввод
    const result = updateUserRoleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }

    const { userId, teamId, role } = result.data;

    // Проверяем, является ли текущий пользователь администратором команды
    const currentUserTeamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
        role: "admin",
      },
    });

    if (!currentUserTeamMember) {
      return NextResponse.json(
        { error: "You don't have permission to update user roles" },
        { status: 403 }
      );
    }

    // Проверяем, существует ли пользователь в команде
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId,
        teamId,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 404 }
      );
    }

    // Обновляем роль пользователя
    const updatedTeamMember = await prisma.teamMember.update({
      where: {
        id: teamMember.id,
      },
      data: {
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Форматируем ответ
    return NextResponse.json({
      id: updatedTeamMember.id,
      userId: updatedTeamMember.userId,
      teamId: updatedTeamMember.teamId,
      role: updatedTeamMember.role,
      user: updatedTeamMember.user,
      permissions:
        PERMISSIONS[updatedTeamMember.role as keyof typeof PERMISSIONS] || [],
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
