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
    console.log("Начинаем загрузку транскрипций из Blob storage");
    const { blobs } = await list();
    console.log("Найдено блобов:", blobs.length);
    const blob = blobs.find((b) => b.pathname === BLOB_KEY);
    console.log("Поиск блоба с именем:", BLOB_KEY, "Найден:", !!blob);

    if (blob) {
      console.log("Загружаем данные из блоба:", blob.url);
      const response = await fetch(blob.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      console.log("Получены данные размером:", text.length, "байт");
      console.log("Содержимое блоба:", text.substring(0, 500) + "...");
      const loadedData = JSON.parse(text);
      // Слияние данных вместо перезаписи
      transcriptionsCache = { ...loadedData, ...transcriptionsCache };
      console.log(
        "Данные успешно загружены в кэш. Количество транскрипций:",
        Object.keys(transcriptionsCache).length,
        "ID транскрипций:",
        Object.keys(transcriptionsCache)
      );
    } else {
      console.log("Блоб не найден, создаем пустой кэш");
      if (Object.keys(transcriptionsCache).length === 0) {
        await saveTranscriptions();
      }
    }
  } catch (error: unknown) {
    console.error(
      "Ошибка при загрузке транскрипций:",
      error instanceof Error ? error.message : String(error)
    );
    console.error("Полная ошибка:", error);
    if (Object.keys(transcriptionsCache).length === 0) {
      transcriptionsCache = {};
      await saveTranscriptions();
    }
  }
}

// Сохранение данных в Blob storage
export async function saveTranscriptions() {
  try {
    console.log("Сохраняем транскрипции в Blob storage");
    const json = JSON.stringify(transcriptionsCache, null, 2);
    console.log("Размер данных для сохранения:", json.length, "байт");
    await put(BLOB_KEY, json, { access: "public" });
    console.log("Транскрипции успешно сохранены в Blob storage");
  } catch (error) {
    console.error("Ошибка при сохранении в Blob storage:", error);
    throw error;
  }
}

// Получение данных транскрипции
export async function getTranscription(id: string) {
  console.log("Запрос транскрипции с ID:", id);
  await loadTranscriptions();
  const transcription = transcriptionsCache[id];
  console.log("Найдена транскрипция:", !!transcription);
  return transcription;
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
