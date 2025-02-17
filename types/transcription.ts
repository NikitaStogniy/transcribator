export type Transcription = {
  id: string;
  userId: string;
  fileName: string;
  status: "processing" | "completed" | "error";
  createdAt: Date;
  durationSeconds: number | null;
  transcriptionText?: string;
  errorMessage?: string;
};
