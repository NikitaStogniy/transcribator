import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTeamSelection } from "./use-team-selection";

export interface Transcription {
  id: string;
  fileId: string;
  content: string;
  status: "pending" | "completed" | "error";
  createdAt: string;
  updatedAt: string;
  teamId: string;
}

// Fetch transcription for a file
const fetchTranscription = async (fileId: string): Promise<Transcription> => {
  const response = await fetch(`/api/transcriptions/${fileId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch transcription");
  }

  return response.json();
};

// Request a transcription for a file
const requestTranscription = async (
  fileId: string,
  teamId: string
): Promise<Transcription> => {
  const response = await fetch("/api/transcriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileId, teamId }),
  });

  if (!response.ok) {
    throw new Error("Failed to request transcription");
  }

  return response.json();
};

// Hook to get transcription for a file
export function useTranscription(fileId: string) {
  return useQuery({
    queryKey: ["transcription", fileId],
    queryFn: () => fetchTranscription(fileId),
    enabled: !!fileId,
    // Polling for transcription status updates
    refetchInterval: (query) => {
      if (query.state.data?.status === "pending") {
        return 5000;
      }
      return false;
    },
  });
}

// Hook to request a transcription
export function useRequestTranscription() {
  const queryClient = useQueryClient();
  const { selectedTeamId } = useTeamSelection();

  return useMutation({
    mutationFn: (fileId: string) =>
      requestTranscription(fileId, selectedTeamId),
    onSuccess: (data) => {
      queryClient.setQueryData(["transcription", data.fileId], data);
    },
  });
}
