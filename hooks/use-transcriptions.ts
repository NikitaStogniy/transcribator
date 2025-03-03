import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedTeam } from "./use-selected-team";

export interface Transcription {
  id: string;
  fileId: string;
  fileName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  teamId: string;
}

// Получение транскрипций из API
const fetchTranscriptions = async (
  teamId?: string
): Promise<Transcription[]> => {
  // Не делаем запрос, если teamId пустой, "default" или undefined
  if (!teamId || teamId === "" || teamId === "default") {
    console.log("Skipping transcriptions fetch - invalid teamId:", teamId);
    return [];
  }

  try {
    const url = `/api/transcriptions?teamId=${teamId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch transcriptions");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching transcriptions:", error);
    // Возвращаем пустой массив при ошибке
    return [];
  }
};

// Получение одной транскрипции по ID
const fetchTranscription = async (id: string): Promise<Transcription> => {
  const response = await fetch(`/api/transcriptions/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch transcription");
  }

  return response.json();
};

// Обновление транскрипции
const updateTranscription = async ({
  id,
  content,
}: {
  id: string;
  content: string;
}): Promise<Transcription> => {
  const response = await fetch(`/api/transcriptions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Failed to update transcription");
  }

  return response.json();
};

// Хук для получения всех транскрипций
export function useTranscriptions() {
  const { data: selectedTeamId } = useSelectedTeam();

  return useQuery({
    queryKey: ["transcriptions", selectedTeamId],
    queryFn: () => fetchTranscriptions(selectedTeamId),
    enabled: !!selectedTeamId && selectedTeamId !== "",
  });
}

// Хук для получения одной транскрипции по ID
export function useTranscription(id?: string) {
  return useQuery({
    queryKey: ["transcription", id],
    queryFn: () => fetchTranscription(id!),
    enabled: !!id,
  });
}

// Хук для обновления транскрипции
export function useUpdateTranscription() {
  const queryClient = useQueryClient();
  const { data: selectedTeamId } = useSelectedTeam();

  return useMutation({
    mutationFn: updateTranscription,
    onSuccess: (data) => {
      // Обновляем кэш для конкретной транскрипции
      queryClient.setQueryData(["transcription", data.id], data);
      // Инвалидируем список всех транскрипций
      queryClient.invalidateQueries({
        queryKey: ["transcriptions", selectedTeamId],
      });
    },
  });
}
