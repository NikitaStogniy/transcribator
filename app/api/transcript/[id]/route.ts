import { getTranscription } from "../../../../lib/transcriptions";
import { NextRequest } from "next/server";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;
    console.log("Запрошенный ID:", id);

    const data = await getTranscription(id);
    console.log("Данные транскрипции:", data);

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Транскрипция не найдена" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Ошибка при получении транскрипции:", error);
    return new Response(
      JSON.stringify({ error: "Ошибка при получении транскрипции" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
