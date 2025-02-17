export interface Transcription {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  fileName: string;
  fileUrl: string;
  status: "pending" | "processing" | "completed" | "error";
  transcriptText?: string | null;
  summary?: string | null;
  userId: string;
}
