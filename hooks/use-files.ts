import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedTeam } from "./use-selected-team";

// Типы для файлов
export type FileStatus = "pending" | "processing" | "completed" | "error";

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: FileStatus;
  uploadedBy: string;
  teamId: string;
}

export interface FileUpload {
  name: string;
  type?: string;
  size?: number;
  teamId: string;
  uploadedBy?: string;
}

// Получение файлов из API
const fetchFiles = async (teamId?: string): Promise<File[]> => {
  const url = teamId ? `/api/files?teamId=${teamId}` : "/api/files";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch files");
  }

  return response.json();
};

// Загрузка файла в API
const uploadFile = async (fileData: FileUpload): Promise<File> => {
  const response = await fetch("/api/files", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fileData),
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  return response.json();
};

// Хук для получения файлов
export function useFiles() {
  const { data: selectedTeamId } = useSelectedTeam();

  return useQuery({
    queryKey: ["files", selectedTeamId],
    queryFn: () => fetchFiles(selectedTeamId),
    enabled: !!selectedTeamId,
  });
}

// Хук для загрузки файла
export function useFileUpload() {
  const queryClient = useQueryClient();
  const { data: selectedTeamId } = useSelectedTeam();

  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      // Инвалидация запроса файлов для обновления списка
      queryClient.invalidateQueries({ queryKey: ["files", selectedTeamId] });
    },
  });
}

// Хук для получения файлов по статусу
export function useFilesByStatus() {
  const { data: files = [] } = useFiles();

  const filesByStatus = {
    pending: files.filter((file) => file.status === "pending"),
    processing: files.filter((file) => file.status === "processing"),
    completed: files.filter((file) => file.status === "completed"),
    error: files.filter((file) => file.status === "error"),
    all: files,
  };

  return filesByStatus;
}
