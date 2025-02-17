import { AssemblyAI, TranscribeParams } from "assemblyai";

// Инициализация клиента AssemblyAI
export function createAssemblyClient() {
  const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!assemblyApiKey) {
    throw new Error("API ключ AssemblyAI не настроен");
  }

  try {
    const client = new AssemblyAI({
      apiKey: assemblyApiKey,
    });

    // Проверяем, что клиент создался корректно
    if (!client || !client.transcripts) {
      throw new Error("Не удалось инициализировать клиент AssemblyAI");
    }

    return client;
  } catch (error) {
    console.error("Ошибка при создании клиента AssemblyAI:", error);
    throw new Error(
      error instanceof Error
        ? `Ошибка при создании клиента AssemblyAI: ${error.message}`
        : "Неизвестная ошибка при создании клиента AssemblyAI"
    );
  }
}

// Загрузка файла в AssemblyAI
export async function uploadAudioFile(client: AssemblyAI, audioBuffer: Buffer) {
  if (!client || !client.files) {
    throw new Error("Некорректный клиент AssemblyAI");
  }

  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error("Пустой аудио буфер");
  }

  try {
    console.log(
      "Starting file upload to AssemblyAI, buffer size:",
      audioBuffer.length
    );
    const uploadUrl = await client.files.upload(audioBuffer);

    if (!uploadUrl) {
      throw new Error("Не удалось получить URL загруженного файла");
    }

    console.log("File uploaded successfully to:", uploadUrl);
    return uploadUrl;
  } catch (error) {
    console.error("Ошибка при загрузке файла в AssemblyAI:", error);
    throw new Error(
      error instanceof Error
        ? `Ошибка при загрузке файла: ${error.message}`
        : "Неизвестная ошибка при загрузке файла"
    );
  }
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
    final_model: "anthropic/claude-3-5-sonnet",
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
