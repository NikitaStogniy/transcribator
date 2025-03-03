import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedTeam } from "./use-selected-team";
import { get, post } from "@/lib/fetch-client";

// Типы для команды
export type TeamRole = "admin" | "editor" | "viewer";

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string;
  role: TeamRole;
  joinedAt: string;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
}

export interface TeamResponse {
  members: TeamMember[];
  team?: Team;
}

export interface NewTeamMember {
  userId: string;
  name?: string;
  email?: string;
  image?: string;
  role: TeamRole;
  teamId: string;
}

// Получение данных команды из API
const fetchTeamData = async (teamId?: string): Promise<TeamResponse> => {
  // Не делаем запрос, если teamId пустой, "default" или undefined
  if (!teamId || teamId === "" || teamId === "default") {
    console.log("Skipping team fetch - invalid teamId:", teamId);
    return { members: [] };
  }

  try {
    return await get<TeamResponse>("/api/team", { teamId });
  } catch (error) {
    console.error("Failed to fetch team data:", error);
    // Возвращаем пустой объект в случае ошибки
    return { members: [] };
  }
};

// Добавление нового члена команды
const addTeamMember = async (
  memberData: NewTeamMember
): Promise<TeamMember> => {
  return post<TeamMember>("/api/team", memberData);
};

// Хук для получения данных команды
export function useTeam() {
  const { data: selectedTeamId } = useSelectedTeam();

  return useQuery({
    queryKey: ["team", selectedTeamId],
    queryFn: () => fetchTeamData(selectedTeamId),
    // Включаем запрос только если есть валидный ID команды (не undefined, не пустая строка)
    enabled: !!selectedTeamId && selectedTeamId !== "",
    // Не считаем ошибку 403 как фатальную
    retry: (failureCount, error: any) => {
      // Повторяем запрос максимум 1 раз, и не повторяем для 403 ошибок
      if (error?.status === 403) return false;
      return failureCount < 1;
    },
  });
}

// Хук для добавления члена команды
export function useAddTeamMember() {
  const queryClient = useQueryClient();
  const { data: selectedTeamId } = useSelectedTeam();

  return useMutation({
    mutationFn: addTeamMember,
    onSuccess: () => {
      // Инвалидация запроса команды для обновления данных
      queryClient.invalidateQueries({ queryKey: ["team", selectedTeamId] });
    },
  });
}

// Хук для получения членов команды по роли
export function useTeamMembersByRole() {
  const { data } = useTeam();
  const members = data?.members || [];

  const membersByRole = {
    admin: members.filter((member) => member.role === "admin"),
    editor: members.filter((member) => member.role === "editor"),
    viewer: members.filter((member) => member.role === "viewer"),
    all: members,
  };

  return membersByRole;
}
