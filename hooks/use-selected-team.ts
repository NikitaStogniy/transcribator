import { useQuery, useQueryClient } from "@tanstack/react-query";

// Ключ для хранения ID выбранной команды
const SELECTED_TEAM_KEY = "selectedTeam";

// Хук для получения ID выбранной команды
export function useSelectedTeam() {
  return useQuery({
    queryKey: [SELECTED_TEAM_KEY],
    // Функция запроса, которая просто возвращает initialData
    queryFn: () => "team-1",
    // Начальное значение - team-1
    initialData: "team-1",
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
