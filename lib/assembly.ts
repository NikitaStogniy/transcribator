/**
 * Assembly AI integration for transcription
 */

// API key from environment variables
const API_KEY = process.env.ASSEMBLY_API_KEY;
const BASE_URL = "https://api.assemblyai.com/v2";

// Types for Assembly AI API
export type TranscriptionParams = {
  audio_url: string;
  language_code?: string;
  speaker_labels?: boolean;
  punctuate?: boolean;
  format_text?: boolean;
  dual_channel?: boolean;
};

export type TranscriptionResult = {
  id: string;
  status: "queued" | "processing" | "completed" | "error";
  text?: string;
  audio_url: string;
  error?: string;
  words?: Array<{
    start: number;
    end: number;
    text: string;
    confidence: number;
    speaker?: string;
  }>;
  utterances?: Array<{
    start: number;
    end: number;
    speaker: string;
    text: string;
  }>;
  confidence?: number;
  language_code?: string;
  audio_duration?: number;
};

// Upload a file to Assembly AI
export async function uploadToAssemblyAI(audioFile: File): Promise<string> {
  try {
    // Convert file to arrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to AssemblyAI
    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: {
        authorization: API_KEY as string,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.upload_url;
  } catch (error) {
    console.error("Error uploading to AssemblyAI:", error);
    throw new Error("Failed to upload audio file for transcription");
  }
}

// Start transcription process
export async function startTranscription(
  audioUrl: string,
  params: Partial<TranscriptionParams> = {}
): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/transcript`, {
      method: "POST",
      headers: {
        authorization: API_KEY as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speaker_labels: true,
        punctuate: true,
        format_text: true,
        ...params,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Transcription request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error starting transcription:", error);
    throw new Error("Failed to start transcription process");
  }
}

// Check transcription status
export async function getTranscriptionStatus(
  transcriptionId: string
): Promise<TranscriptionResult> {
  try {
    const response = await fetch(`${BASE_URL}/transcript/${transcriptionId}`, {
      headers: {
        authorization: API_KEY as string,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get transcription status: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting transcription status:", error);
    throw new Error("Failed to get transcription status");
  }
}
