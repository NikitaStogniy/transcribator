import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelectedTeam } from "./use-selected-team";

interface CheckTranscriptionResponse {
  message: string;
  status: "queued" | "processing" | "completed" | "error";
  transcription?: {
    id: string;
    fileId: string;
    text?: string;
    status: string;
  };
  error?: string;
}

// Function to check transcription status
const checkTranscriptionStatus = async (
  fileId: string,
  teamId: string
): Promise<CheckTranscriptionResponse> => {
  const response = await fetch("/api/transcriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileId, teamId }),
  });

  if (!response.ok) {
    throw new Error("Failed to check transcription status");
  }

  return response.json();
};

// Hook to check transcription status
export function useCheckTranscription() {
  const queryClient = useQueryClient();
  const { data: selectedTeamId } = useSelectedTeam();

  return useMutation({
    mutationFn: (fileId: string) =>
      checkTranscriptionStatus(fileId, selectedTeamId!),
    onSuccess: (data, fileId) => {
      // If status changed to completed or error, update the file and transcription data
      if (data.status === "completed" || data.status === "error") {
        // Invalidate file queries to refresh file status
        queryClient.invalidateQueries({ queryKey: ["files"] });

        // Invalidate the specific transcription query
        queryClient.invalidateQueries({ queryKey: ["transcription", fileId] });

        // Invalidate all transcriptions
        queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
      }
    },
  });
}
