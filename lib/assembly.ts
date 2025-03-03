/**
 * Assembly AI integration for transcription using the official SDK
 */
import { AssemblyAI } from "assemblyai";

// Helper function for consistent logging
function logInfo(operation: string, message: string, data?: any) {
  const logMessage = `[ASSEMBLY:${operation}] ${message}`;
  console.log(logMessage, data ? data : "");
}

function logError(operation: string, message: string, error: any) {
  const logMessage = `[ASSEMBLY:${operation}:ERROR] ${message}`;
  console.error(logMessage, error);
}

// Initialize the client with API key
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY as string,
});

logInfo("INIT", "AssemblyAI client initialized");

// Types for Assembly AI API responses
export type TranscriptionParams = {
  audio_url?: string;
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
  const operationId = `upload_${Date.now()}`;
  try {
    logInfo(
      "UPLOAD",
      `Starting upload operation ${operationId} for file ${audioFile.name} (${audioFile.size} bytes)`
    );

    // Convert file to buffer
    logInfo("UPLOAD", `Converting file to buffer`);
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    logInfo("UPLOAD", `File converted to buffer (${buffer.length} bytes)`);

    // Upload to AssemblyAI using the SDK
    logInfo("UPLOAD", `Sending file to AssemblyAI API`);
    const uploadUrl = await client.files.upload(buffer);
    logInfo("UPLOAD", `Upload successful, received URL: ${uploadUrl}`);

    return uploadUrl;
  } catch (error) {
    logError(
      "UPLOAD",
      `Failed to upload file ${audioFile.name} (operation ${operationId})`,
      error
    );
    throw new Error("Failed to upload audio file for transcription");
  }
}

// Start transcription process
export async function startTranscription(
  audioUrl: string,
  params: Partial<TranscriptionParams> = {}
): Promise<string> {
  const operationId = `transcribe_${Date.now()}`;
  try {
    logInfo(
      "TRANSCRIBE",
      `Starting transcription operation ${operationId} for URL: ${audioUrl}`
    );
    logInfo("TRANSCRIBE", `Transcription parameters:`, {
      speaker_labels: params.speaker_labels ?? true,
      punctuate: params.punctuate ?? true,
      format_text: params.format_text ?? true,
      language_code: params.language_code,
    });

    // Submit transcription job with the SDK
    logInfo("TRANSCRIBE", `Submitting transcription job to AssemblyAI`);
    const transcript = await client.transcripts.submit({
      audio: audioUrl,
      speaker_labels: params.speaker_labels ?? true,
      punctuate: params.punctuate ?? true,
      format_text: params.format_text ?? true,
      language_code: params.language_code,
    });

    logInfo(
      "TRANSCRIBE",
      `Transcription job submitted successfully with ID: ${transcript.id}`
    );
    logInfo("TRANSCRIBE", `Initial status: ${transcript.status}`);

    return transcript.id;
  } catch (error) {
    logError(
      "TRANSCRIBE",
      `Failed to start transcription for URL: ${audioUrl} (operation ${operationId})`,
      error
    );
    throw new Error("Failed to start transcription process");
  }
}

// Check transcription status
export async function getTranscriptionStatus(
  transcriptionId: string
): Promise<TranscriptionResult> {
  try {
    logInfo("STATUS", `Checking status for transcription: ${transcriptionId}`);

    const transcript = await client.transcripts.get(transcriptionId);

    logInfo(
      "STATUS",
      `Retrieved status for transcription ${transcriptionId}: ${transcript.status}`
    );
    if (transcript.status === "completed") {
      logInfo(
        "STATUS",
        `Transcription ${transcriptionId} completed successfully`
      );
      logInfo(
        "STATUS",
        `Text length: ${transcript.text?.length || 0} characters`
      );
    } else if (transcript.status === "error") {
      logError(
        "STATUS",
        `Transcription ${transcriptionId} failed with error`,
        transcript.error
      );
    }

    return transcript as unknown as TranscriptionResult;
  } catch (error) {
    logError(
      "STATUS",
      `Error fetching status for transcription ${transcriptionId}`,
      error
    );
    throw new Error("Failed to get transcription status");
  }
}
