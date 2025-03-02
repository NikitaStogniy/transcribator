import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedTeam } from "./use-selected-team";
import { get, post } from "@/lib/fetch-client";

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
  teamId?: string;
  uploadedBy?: string;
}

// Получение файлов из API
const fetchFiles = async (teamId?: string): Promise<File[]> => {
  if (!teamId) {
    return [];
  }
  return get<File[]>("/api/files", { teamId });
};

// Загрузка файла в API
const uploadFile = async (fileData: FileUpload): Promise<File> => {
  // We need to use FormData for file uploads
  const formData = new FormData();

  // In a real implementation, this would be a real File object from an input
  // For our mock implementation, we'll just create a text file
  const mockFileContent = `This is a mock file for ${fileData.name}`;
  const mockFile = new Blob([mockFileContent], {
    type: fileData.type || "text/plain",
  });

  formData.append("file", mockFile, fileData.name);

  // Add teamId if provided
  if (fileData.teamId) {
    formData.append("teamId", fileData.teamId);
  }

  // Make the request with FormData
  return fetch("/api/files/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    return response.json();
  });
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
