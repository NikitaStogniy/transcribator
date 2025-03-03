import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedTeam } from "./use-selected-team";
import { get, post } from "@/lib/fetch-client";

// Типы для файлов
export type FileStatus = "pending" | "processing" | "completed" | "error";

export interface FileData {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  blobUrl: string;
  status: FileStatus;
  userId: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileUpload {
  name: string;
  type?: string;
  size?: number;
  teamId?: string;
  uploadedBy?: string;
  file?: File; // This is browser's File object
}

// Получение файлов из API
const fetchFiles = async (teamId?: string): Promise<FileData[]> => {
  // Не делаем запрос, если teamId пустой, "default" или undefined
  if (!teamId || teamId === "" || teamId === "default") {
    console.log("Skipping files fetch - invalid teamId:", teamId);
    return [];
  }

  try {
    return await get<FileData[]>("/api/files", { teamId });
  } catch (error) {
    console.error("Error fetching files:", error);
    // Возвращаем пустой массив при ошибке
    return [];
  }
};

// Загрузка файла в API
const uploadFile = async (fileData: FileUpload): Promise<FileData> => {
  if (!fileData.file) {
    throw new Error("No file provided");
  }

  // We need to use FormData for file uploads
  const formData = new FormData();

  // Use the actual file
  formData.append("file", fileData.file);

  // Add teamId if provided
  if (fileData.teamId) {
    formData.append("teamId", fileData.teamId);
  }

  // Make the request with FormData - Fix the API path
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
    enabled: !!selectedTeamId && selectedTeamId !== "",
  });
}

// Хук для загрузки файла
export function useFileUpload() {
  const queryClient = useQueryClient();
  const { data: selectedTeamId } = useSelectedTeam();

  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      // Инвалидация запроса файлов для обновления списка, только если есть валидный ID команды
      if (selectedTeamId && selectedTeamId !== "") {
        queryClient.invalidateQueries({ queryKey: ["files", selectedTeamId] });
      }
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
