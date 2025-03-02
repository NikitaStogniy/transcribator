import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTeamSelection } from "./use-team-selection";

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
  let url = "/api/documents";
  const params = new URLSearchParams();

  if (teamId) {
    params.append("teamId", teamId);
  }

  if (fileId) {
    params.append("fileId", fileId);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }

  return response.json();
};

// Create a new document
const createDocument = async (documentData: NewDocument): Promise<Document> => {
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(documentData),
  });

  if (!response.ok) {
    throw new Error("Failed to create document");
  }

  return response.json();
};

// Hook for fetching documents
export function useDocuments(fileId?: string) {
  const { selectedTeamId } = useTeamSelection();

  return useQuery({
    queryKey: ["documents", selectedTeamId, fileId],
    queryFn: () => fetchDocuments(selectedTeamId, fileId),
    enabled: !!selectedTeamId,
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
