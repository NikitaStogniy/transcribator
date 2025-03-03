import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTeamSelection } from "./use-team-selection";
import { get, post } from "@/lib/fetch-client";

export interface Document {
  id: string;
  title: string;
  meetingId: string;
  fileId: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  teamId: string;
  createdBy: string;
}

interface NewDocument {
  title: string;
  meetingId?: string;
  fileId: string;
  summary?: string;
  teamId: string;
  createdBy: string;
}

// Fetch documents from the API
const fetchDocuments = async (
  teamId?: string,
  fileId?: string
): Promise<Document[]> => {
  // Не делаем запрос, если teamId пустой, "default" или undefined
  if (!teamId || teamId === "" || teamId === "default") {
    console.log("Skipping documents fetch - invalid teamId:", teamId);
    return [];
  }

  const params: Record<string, string> = { teamId };
  if (fileId) {
    params.fileId = fileId;
  }

  try {
    return await get<Document[]>("/api/documents", params);
  } catch (error) {
    console.error("Error fetching documents:", error);
    // Возвращаем пустой массив при ошибке
    return [];
  }
};

// Create a new document
const createDocument = async (documentData: NewDocument): Promise<Document> => {
  return post<Document>("/api/documents", documentData);
};

// Hook for fetching documents
export function useDocuments(fileId?: string) {
  const { selectedTeamId } = useTeamSelection();

  return useQuery({
    queryKey: ["documents", selectedTeamId, fileId],
    queryFn: () => fetchDocuments(selectedTeamId, fileId),
    enabled: !!selectedTeamId && selectedTeamId !== "",
  });
}

// Hook for creating a document
export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { selectedTeamId } = useTeamSelection();

  return useMutation({
    mutationFn: createDocument,
    onSuccess: (data) => {
      // Invalidate the documents queries to refetch the list
      queryClient.invalidateQueries({
        queryKey: ["documents", selectedTeamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["documents", selectedTeamId, data.fileId],
      });
    },
  });
}

// Hook for getting documents sorted by date
export function useDocumentsSortedByDate() {
  const { data: documents = [] } = useDocuments();

  const sortedDocuments = [...documents].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return sortedDocuments;
}
