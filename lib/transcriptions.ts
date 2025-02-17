import { put, list } from "@vercel/blob";
import { createAssemblyClient, queryLeMur } from "./assemblyai";

// Интерфейс для данных транскрипции
interface TranscriptionData {
  audioUrl: string;
  assemblyAudioUrl: string;
  status: string;
  transcriptId?: string;
  transcript?: {
    id: string;
    [key: string]: unknown;
  };
  summary?: string;
  summaryError?: string;
  lemurResponse?: string;
}

// Хранилище транскрипций в памяти (кэш)
let transcriptionsCache: Record<string, TranscriptionData> = {};

const BLOB_KEY = "transcriptions.json";

// Загрузка данных из Blob storage
export async function loadTranscriptions() {
  try {
    const { blobs } = await list();
    const blob = blobs.find((b) => b.pathname === BLOB_KEY);
    if (blob) {
      const response = await fetch(blob.url);
      const text = await response.text();
      transcriptionsCache = JSON.parse(text);
    } else {
      transcriptionsCache = {};
      await saveTranscriptions();
    }
  } catch (error: unknown) {
    console.error(
      "Ошибка при загрузке транскрипций:",
      error instanceof Error ? error.message : String(error)
    );
    transcriptionsCache = {};
    await saveTranscriptions();
  }
}

// Сохранение данных в Blob storage
export async function saveTranscriptions() {
  const json = JSON.stringify(transcriptionsCache, null, 2);
  await put(BLOB_KEY, json, { access: "public" });
}

// Получение данных транскрипции
export async function getTranscription(id: string) {
  await loadTranscriptions();
  return transcriptionsCache[id];
}

export async function queryTranscriptByLeMur(
  query: string,
  data: TranscriptionData
) {
  if (!data.transcript?.id) {
    throw new Error("ID транскрипции не найден");
  }

  try {
    const client = createAssemblyClient();
    const response = await queryLeMur(client, data.transcript.id, query);
    await updateTranscription(data.transcript.id, {
      lemurResponse: response,
    });
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Ошибка при запросе к LeMUR:", errorMessage);
    throw error;
  }
}

// Сохранение данных транскрипции
export async function saveTranscription(id: string, data: TranscriptionData) {
  transcriptionsCache[id] = data;
  await saveTranscriptions();
}

// Обновление данных транскрипции
export async function updateTranscription(
  id: string,
  data: Partial<TranscriptionData>
) {
  transcriptionsCache[id] = { ...transcriptionsCache[id], ...data };
  await saveTranscriptions();
}

// Инициализация при импорте
loadTranscriptions();
