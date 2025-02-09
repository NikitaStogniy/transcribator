import { AssemblyAI, TranscribeParams } from "assemblyai";
import path from "path";
import { writeFile } from "fs/promises";
import {
  saveTranscription,
  updateTranscription,
} from "../../../lib/transcriptions";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "Аудиофайл не найден" }), {
        status: 400,
      });
    }

    const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyApiKey) {
      throw new Error("API ключ AssemblyAI не настроен");
    }

    // Инициализируем клиент AssemblyAI
    const client = new AssemblyAI({
      apiKey: assemblyApiKey,
    });

    // Загружаем файл в AssemblyAI
    const uploadResponse = await client.files.upload(
      Buffer.from(await audioFile.arrayBuffer())
    );

    // Запускаем транскрипцию с помощью SDK
    const config: TranscribeParams = {
      audio: uploadResponse,
      language_code: "ru",
      speaker_labels: true,
      sentiment_analysis: false,
      iab_categories: false,
      entity_detection: true,
      auto_highlights: false,
    };

    // Получаем ID транскрипции от AssemblyAI
    const transcript = await client.transcripts.transcribe(config);
    const transcriptId = transcript.id;

    // Сохраняем аудиофайл локально
    const fileExtension = audioFile.name.split(".").pop() || "mp3";
    const fileName = `${transcriptId}.${fileExtension}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    await writeFile(filePath, Buffer.from(await audioFile.arrayBuffer()));

    // Публичный URL для аудио
    const audioUrl = `/uploads/${fileName}`;

    console.log("audioUrl", audioUrl);

    // Сохраняем начальные данные о транскрипции
    await saveTranscription(transcriptId, {
      audioUrl,
      assemblyAudioUrl: uploadResponse,
      status: "processing",
    });

    // Асинхронно запускаем опрос статуса
    startTranscription(transcriptId, client);

    return new Response(
      JSON.stringify({ link: `/transcription/${transcriptId}` }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка в /api/upload:", (error as Error).message);
    return new Response(
      JSON.stringify({ error: "Ошибка загрузки или транскрипции" }),
      { status: 500 }
    );
  }
}

async function startTranscription(transcriptId: string, client: AssemblyAI) {
  try {
    // Опрашиваем статус транскрипции
    let completed = false;
    while (!completed) {
      const status = await client.transcripts.get(transcriptId);
      await updateTranscription(transcriptId, { status: status.status });

      if (status.status === "completed") {
        await updateTranscription(transcriptId, {
          transcript: status,
          status: "completed",
        });

        // Создаем краткое содержание с помощью LeMUR
        try {
          const { response } = await client.lemur.task({
            transcript_ids: [transcriptId],
            prompt:
              "Предоставьте краткое содержание этой записи на русском языке. Включите основные темы, ключевые моменты и важные детали.",
            final_model: "anthropic/claude-3-sonnet",
          });

          await updateTranscription(transcriptId, { summary: response });
        } catch (summaryError) {
          console.error(
            "Ошибка при создании краткого содержания:",
            (summaryError as Error).message
          );
          await updateTranscription(transcriptId, {
            summaryError: "Не удалось создать краткое содержание",
          });
        }

        completed = true;
      } else if (status.status === "error") {
        await updateTranscription(transcriptId, { status: "error" });
        completed = true;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  } catch (error) {
    console.error("Ошибка при транскрипции:", (error as Error).message);
    await updateTranscription(transcriptId, { status: "error" });
  }
}
