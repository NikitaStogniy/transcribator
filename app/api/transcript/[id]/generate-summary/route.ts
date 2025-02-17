import { generateSummaryIfNeeded } from "../../../../../lib/transcriptions";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await generateSummaryIfNeeded(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Ошибка при генерации summary:", error);
    return new Response(
      JSON.stringify({ error: "Ошибка при генерации summary" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
