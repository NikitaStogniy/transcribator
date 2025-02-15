import { AssemblyAI, TranscribeParams } from "assemblyai";

// Инициализация клиента AssemblyAI
export function createAssemblyClient() {
  const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!assemblyApiKey) {
    throw new Error("API ключ AssemblyAI не настроен");
  }

  return new AssemblyAI({
    apiKey: assemblyApiKey,
  });
}

// Загрузка файла в AssemblyAI
export async function uploadAudioFile(client: AssemblyAI, audioBuffer: Buffer) {
  return await client.files.upload(audioBuffer);
}

// Создание транскрипции
export async function createTranscription(
  client: AssemblyAI,
  uploadResponse: string,
  userConfig: Partial<TranscribeParams> = {}
) {
  // Значения по умолчанию для конфигурации транскрипции
  const defaultConfig: Partial<TranscribeParams> = {
    language_code: "ru",
    speaker_labels: true,
    sentiment_analysis: false,
    iab_categories: false,
    entity_detection: false,
    speech_model: "best",
    auto_highlights: false,
    speakers_expected: 4,
  };

  // Объединяем настройки по умолчанию и пользовательские данные
  const config: TranscribeParams = {
    ...defaultConfig,
    ...userConfig,
    audio: uploadResponse,
  } as TranscribeParams;

  return await client.transcripts.transcribe(config);
}

// Получение статуса транскрипции
export async function getTranscriptionStatus(
  client: AssemblyAI,
  transcriptId: string
) {
  return await client.transcripts.get(transcriptId);
}

// Запрос к LeMUR
export async function queryLeMur(
  client: AssemblyAI,
  transcriptId: string,
  prompt: string
) {
  const { response } = await client.lemur.task({
    transcript_ids: [transcriptId],
    prompt: prompt,
    final_model: 'anthropic/claude-3-5-sonnet'
  });
  return response;
}

// Создание резюме с помощью LeMUR
export async function createSummaries(
  client: AssemblyAI,
  transcriptId: string
) {
  const templates = [
    {
      key: "summary_template1",
      prompt:
        "Резюме встречи. Предоставьте подробное содержание этой записи на русском языке, выделив основные темы и ключевые моменты. В формате ответа используй ЗАДАЧА, ИСПОЛНИТЕЛЬ, ДАТА. Если исполнитель или дата не определены, ставь неизвестно. Используй форматирование MD",
    },
  ];

  const results: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const template of templates) {
    try {
      const response = await queryLeMur(client, transcriptId, template.prompt);
      results[template.key] = response;
    } catch (error) {
      errors[`${template.key}Error`] =
        "Не удалось создать резюме для данного шаблона";
    }
  }

  return { results, errors };
}
