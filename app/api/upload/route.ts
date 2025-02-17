import { TranscribeParams, AssemblyAI } from "assemblyai";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  createTranscription,
  updateTranscriptionStatus,
  updateTranscriptionMetadata,
} from "@/lib/db/transcriptions";
import { createAssemblyClient, uploadAudioFile } from "@/lib/assemblyai";
import { SupportedLanguage } from "@/lib/transcriptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const formData = await req.formData();
    console.log("Received form data:", {
      file: formData.get("file"),
      language: formData.get("language"),
      participantsCount: formData.get("participantsCount"),
    });

    const audioFile = formData.get("file") as File;
    const language = formData.get("language") as SupportedLanguage;
    const participantsCount =
      parseInt(formData.get("participantsCount") as string) || 1;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "Audio file not found" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Проверка размера файла (максимум 100MB)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB в байтах
    if (audioFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File size exceeds 100MB limit" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Проверка формата файла
    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-m4a",
      "audio/mp4",
      "audio/aac",
    ];
    if (!allowedTypes.includes(audioFile.type)) {
      return new Response(
        JSON.stringify({
          error:
            "Unsupported file format. Please upload MP3, WAV, M4A, or AAC file",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const transcriptionData = {
      userId: session.user.id,
      fileName: audioFile.name,
      language,
      participantsCount,
      status: "uploading",
      createdAt: new Date().toISOString(),
    };

    console.log("Creating DB record with:", transcriptionData);

    // Создаем запись в БД
    try {
      const dbTranscription = await createTranscription(transcriptionData);
      console.log("DB record created:", dbTranscription);

      // Загружаем файл в blob storage
      console.log("Uploading to blob storage...");
      const blob = await put(
        `transcriptions/${dbTranscription.id}/${audioFile.name}`,
        audioFile,
        {
          access: "public",
        }
      );
      console.log("Blob storage upload complete:", blob.url);

      // Обновляем URL файла в БД
      await updateTranscriptionMetadata(dbTranscription.id, {
        audioUrl: blob.url,
      });

      // Создаем клиент AssemblyAI
      console.log("Creating AssemblyAI client...");
      const client = createAssemblyClient();

      // Загружаем аудио в AssemblyAI
      console.log("Converting file to buffer...");
      const arrayBuffer = await audioFile.arrayBuffer();
      console.log("Array buffer size:", arrayBuffer.byteLength);
      const audioBuffer = Buffer.from(arrayBuffer);
      console.log("Buffer size:", audioBuffer.length);

      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error("Failed to convert file to buffer");
      }

      console.log("Uploading to AssemblyAI...");
      const assemblyAudioUrl = await uploadAudioFile(client, audioBuffer);
      console.log("AssemblyAI upload complete:", assemblyAudioUrl);

      // Запускаем транскрибацию
      const params: TranscribeParams = {
        audio_url: assemblyAudioUrl,
        language_code: language,
        speaker_labels: participantsCount > 1,
        speakers_expected: participantsCount,
      };

      console.log("Starting transcription with params:", params);

      if (!params.audio_url) {
        throw new Error("Audio URL is required for transcription");
      }

      try {
        const transcript = await client.transcripts.create(params);
        if (!transcript) {
          throw new Error("Failed to create transcript: Response is null");
        }
        console.log("Transcription started:", transcript.id);
        await updateTranscriptionStatus(
          dbTranscription.id,
          "processing",
          transcript.id
        );

        return new Response(
          JSON.stringify({
            transcriptionId: dbTranscription.id,
            status: "processing",
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Error starting transcription:", error);
        await updateTranscriptionStatus(dbTranscription.id, "error");

        return new Response(
          JSON.stringify({
            error: "Failed to start transcription",
            details: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error("Error in database operation:", error);
      return new Response(
        JSON.stringify({
          error: "Database operation failed",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error in upload:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process upload",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
