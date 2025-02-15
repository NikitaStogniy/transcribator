import {
  getTranscription,
  queryTranscriptByLeMur,
} from "../../../../../lib/transcriptions";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Параметр 'query' обязателен" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Получен запрос к транскрипции через leMur:", query);

    // Получаем данные транскрипции по id
    const data = await getTranscription(id);
    if (!data) {
      return new Response(
        JSON.stringify({ error: "Транскрипция не найдена" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Обработка запроса через leMur (реализуйте эту функцию в соответствии с вашими требованиями)
    const result = await queryTranscriptByLeMur(query, data);

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Ошибка при запросе транскрипции через leMur:", error);
    return new Response(
      JSON.stringify({ error: "Ошибка при обработке запроса к транскрипции" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
