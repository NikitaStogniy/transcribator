import fs from "fs/promises";
import path from "path";
import { createAssemblyClient, queryLeMur } from "./assemblyai";

const TRANSCRIPTIONS_FILE = path.join(
  process.cwd(),
  "data",
  "transcriptions.json"
);

// Интерфейс для данных транскрипции
interface TranscriptionData {
  audioUrl: string;
  assemblyAudioUrl: string;
  status: string;
  transcriptId?: string;
  transcript?: any;
  summary?: string;
  summaryError?: string;
  lemurResponse?: string;
}

// Хранилище транскрипций
export let transcriptions: Record<string, TranscriptionData> = {};

// Загрузка данных при старте
export async function loadTranscriptions() {
  try {
    await fs.mkdir(path.dirname(TRANSCRIPTIONS_FILE), { recursive: true });
    const data = await fs.readFile(TRANSCRIPTIONS_FILE, "utf-8");
    transcriptions = JSON.parse(data);
  } catch (error) {
    // Если файл не существует или пуст, создаем новый
    transcriptions = {};
    await saveTranscriptions();
  }
}

// Сохранение данных в файл
export async function saveTranscriptions() {
  await fs.writeFile(
    TRANSCRIPTIONS_FILE,
    JSON.stringify(transcriptions, null, 2)
  );
}

// Получение данных транскрипции
export async function getTranscription(id: string) {
  await loadTranscriptions();
  return transcriptions[id];
}

export async function queryTranscriptByLeMur(
  query: string,
  data: TranscriptionData
) {
  if (!data.transcript.id) {
    console.log(data.transcript);
    throw new Error("ID транскрипции не найден");
  }

  try {
    const client = createAssemblyClient();
    const response = await queryLeMur(client, data.transcript.id, query);
    await updateTranscription(data.transcript.id, {
      lemurResponse: response,
    });
    return response;
  } catch (error) {
    console.error("Ошибка при запросе к LeMUR:", (error as Error).message);
    throw error;
  }
}

// Сохранение данных транскрипции
export async function saveTranscription(id: string, data: TranscriptionData) {
  transcriptions[id] = data;
  await saveTranscriptions();
}

// Обновление данных транскрипции
export async function updateTranscription(
  id: string,
  data: Partial<TranscriptionData>
) {
  transcriptions[id] = { ...transcriptions[id], ...data };
  await saveTranscriptions();
}

// Инициализация при импорте
loadTranscriptions();
