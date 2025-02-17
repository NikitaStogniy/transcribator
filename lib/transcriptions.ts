import { put, list, del } from "@vercel/blob";
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

const TRANSCRIPTIONS_DIR = "transcriptions";

// Получение имени файла для транскрипции
function getTranscriptionFileName(id: string) {
  return `${TRANSCRIPTIONS_DIR}/${id}.json`;
}

// Загрузка данных из Blob storage
export async function loadTranscriptions() {
  try {
    console.log("Начинаем загрузку транскрипций из Blob storage");
    const { blobs } = await list({ prefix: TRANSCRIPTIONS_DIR });
    console.log("Найдено блобов:", blobs.length);

    // Загружаем каждую транскрипцию отдельно
    for (const blob of blobs) {
      // Пропускаем не JSON файлы
      if (!blob.pathname.endsWith(".json")) {
        console.log("Пропускаем не JSON файл:", blob.pathname);
        continue;
      }

      try {
        console.log("Загружаем данные из блоба:", blob.url);
        const response = await fetch(blob.url, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!response.ok) {
          console.error(`Ошибка загрузки ${blob.url}: ${response.status}`);
          continue;
        }

        const text = await response.text();
        const data = JSON.parse(text);
        const id = blob.pathname.split("/").pop()?.replace(".json", "") || "";
        transcriptionsCache[id] = data;
      } catch (error) {
        console.error(`Ошибка при загрузке ${blob.url}:`, error);
      }
    }

    console.log(
      "Данные успешно загружены в кэш. Количество транскрипций:",
      Object.keys(transcriptionsCache).length,
      "ID транскрипций:",
      Object.keys(transcriptionsCache)
    );
  } catch (error: unknown) {
    console.error(
      "Ошибка при загрузке транскрипций:",
      error instanceof Error ? error.message : String(error)
    );
    console.error("Полная ошибка:", error);
  }
}

// Сохранение данных транскрипции
export async function saveTranscription(id: string, data: TranscriptionData) {
  console.log("Сохраняем новую транскрипцию с ID:", id);
  console.log("Текущее состояние кэша:", Object.keys(transcriptionsCache));
  transcriptionsCache[id] = data;

  try {
    const json = JSON.stringify(data, null, 2);
    const fileName = getTranscriptionFileName(id);
    await put(fileName, json, {
      access: "public",
      addRandomSuffix: false,
    });
    console.log("Транскрипция успешно сохранена:", id);
  } catch (error) {
    console.error("Ошибка при сохранении транскрипции:", error);
    throw error;
  }
}

// Получение данных транскрипции
export async function getTranscription(id: string) {
  console.log("Запрос транскрипции с ID:", id);

  // Сначала проверяем кэш
  if (transcriptionsCache[id]) {
    console.log("Найдена транскрипция в кэше");
    return transcriptionsCache[id];
  }

  // Если нет в кэше, пробуем загрузить из блоба
  try {
    const fileName = getTranscriptionFileName(id);
    const { blobs } = await list({ prefix: fileName });
    const blob = blobs[0];

    if (blob) {
      console.log("Загружаем транскрипцию из блоба:", blob.url);
      const response = await fetch(blob.url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      transcriptionsCache[id] = data;
      console.log("Транскрипция успешно загружена");
      return data;
    }
  } catch (error) {
    console.error("Ошибка при загрузке транскрипции:", error);
  }

  console.log("Транскрипция не найдена");
  return undefined;
}

// Обновление данных транскрипции
export async function updateTranscription(
  id: string,
  data: Partial<TranscriptionData>
) {
  console.log("Обновляем транскрипцию с ID:", id);
  const currentData = transcriptionsCache[id];
  if (!currentData) {
    throw new Error("Транскрипция не найдена в кэше");
  }

  const updatedData = { ...currentData, ...data };
  await saveTranscription(id, updatedData);
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

// Инициализация при импорте
loadTranscriptions();
