import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { get } from "@/lib/fetch-client";

// Ключ для хранения ID выбранной команды
const SELECTED_TEAM_KEY = "selectedTeam";

// Тип для ответа API с командами пользователя
interface UserTeamsResponse {
  teams: {
    id: string;
    name: string;
  }[];
}

// Получение команд пользователя
async function fetchUserTeams(): Promise<UserTeamsResponse> {
  try {
    return await get<UserTeamsResponse>("/api/user/teams");
  } catch (error) {
    console.error("Failed to fetch user teams:", error);
    return { teams: [] };
  }
}

// Хук для получения всех команд пользователя
export function useUserTeams() {
  return useQuery({
    queryKey: ["userTeams"],
    queryFn: fetchUserTeams,
  });
}

// Хук для получения ID выбранной команды
export function useSelectedTeam() {
  const { data: userTeamsData } = useUserTeams();
  const queryClient = useQueryClient();

  // Эффект для установки первой доступной команды, если еще не выбрана
  useEffect(() => {
    if (userTeamsData?.teams && userTeamsData.teams.length > 0) {
      const currentSelectedTeam = queryClient.getQueryData([SELECTED_TEAM_KEY]);

      // Если нет выбранной команды или выбранная команда не в списке доступных
      // или выбранная команда имеет некорректное значение
      if (
        !currentSelectedTeam ||
        currentSelectedTeam === "" ||
        currentSelectedTeam === "default" ||
        !userTeamsData.teams.some((team) => team.id === currentSelectedTeam)
      ) {
        console.log("Setting default team to:", userTeamsData.teams[0].id);
        queryClient.setQueryData(
          [SELECTED_TEAM_KEY],
          userTeamsData.teams[0].id
        );
      }
    }
  }, [userTeamsData, queryClient]);

  return useQuery({
    queryKey: [SELECTED_TEAM_KEY],
    // Используем первую доступную команду как initialData
    initialData: () => {
      // Если есть данные о командах, берем ID первой
      if (userTeamsData?.teams && userTeamsData.teams.length > 0) {
        return userTeamsData.teams[0].id;
      }
      // Не возвращаем пустую строку или "default", а возвращаем undefined
      // чтобы другие компоненты знали, что данные еще не загружены
      return undefined;
    },
    // Функция запроса просто возвращает текущие данные
    queryFn: () => {
      const currentData = queryClient.getQueryData<string>([SELECTED_TEAM_KEY]);
      if (
        !currentData &&
        userTeamsData?.teams &&
        userTeamsData.teams.length > 0
      ) {
        // Если нет выбранной команды, но есть список команд - выбираем первую
        const newTeamId = userTeamsData.teams[0].id;
        queryClient.setQueryData([SELECTED_TEAM_KEY], newTeamId);
        return newTeamId;
      }
      return currentData || undefined;
    },
    // Данные не устаревают
    staleTime: Infinity,
  });
}

// Хук для установки ID выбранной команды
export function useSetSelectedTeam() {
  const queryClient = useQueryClient();

  return (teamId: string) => {
    queryClient.setQueryData([SELECTED_TEAM_KEY], teamId);
  };
}
