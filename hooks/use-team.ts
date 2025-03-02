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
  if (!teamId) {
    return { members: [] };
  }
  return get<TeamResponse>("/api/team", { teamId });
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
    enabled: !!selectedTeamId,
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
