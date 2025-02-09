import fs from "fs/promises";
import path from "path";

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
