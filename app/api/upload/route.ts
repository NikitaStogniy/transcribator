import { TranscribeParams, AssemblyAI } from "assemblyai";
import { put } from "@vercel/blob";
import {
  saveTranscription,
  updateTranscription,
} from "../../../lib/transcriptions";
import {
  createAssemblyClient,
  uploadAudioFile,
  createTranscription,
  getTranscriptionStatus,
  createSummaries,
} from "../../../lib/assemblyai";

export const maxDuration = 60; // This function can run for a maximum of 5 seconds

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "Аудиофайл не найден" }), {
        status: 400,
      });
    }

    // Получаем дополнитильные параметры конфигурации из запроса (например, через поле "config")
    const configField = formData.get("config");
    let userConfig: Partial<TranscribeParams> = {};
    if (configField && typeof configField === "string") {
      try {
        userConfig = JSON.parse(configField);
      } catch (jsonError) {
        console.error("Ошибка парсинга config:", (jsonError as Error).message);
      }
    }

    // Инициализируем клиент AssemblyAI
    const client = createAssemblyClient();

    // Загружаем файл в AssemblyAI
    const uploadResponse = await uploadAudioFile(
      client,
      Buffer.from(await audioFile.arrayBuffer())
    );

    // Создаем транскрипцию
    const transcript = await createTranscription(
      client,
      uploadResponse,
      userConfig
    );
    const transcriptId = transcript.id;

    // Загружаем файл в Vercel Blob
    const fileExtension = audioFile.name.split(".").pop() || "mp3";
    const fileName = `${transcriptId}.${fileExtension}`;
    const blob = await put(fileName, audioFile, {
      access: "public",
    });

    // Сохраняем начальные данные о транскрипции
    await saveTranscription(transcriptId, {
      audioUrl: blob.url,
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
      const status = await getTranscriptionStatus(client, transcriptId);
      await updateTranscription(transcriptId, { status: status.status });

      if (status.status === "completed") {
        await updateTranscription(transcriptId, {
          transcript: status,
          status: "completed",
        });

        // Создаем различные краткие содержания с помощью LeMUR
        const { results, errors } = await createSummaries(client, transcriptId);
        await updateTranscription(transcriptId, { ...results, ...errors });

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
