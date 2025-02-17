import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTranscription } from "@/lib/db/transcriptions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const id = params.id;
    const transcription = await getTranscription(id);

    if (!transcription) {
      console.log("Transcription not found for ID:", id);
      return new Response(
        JSON.stringify({ error: "Transcription not found" }),
        { status: 404 }
      );
    }

    // Check if the transcription belongs to the user
    if (transcription.userId !== session.user.id) {
      console.log("Unauthorized access attempt for transcription:", id);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    console.log("Returning segments for transcription:", id);
    return new Response(JSON.stringify(transcription.segments), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error getting transcription segments:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to get transcription segments",
        details: (error as Error).message,
      }),
      { status: 500 }
    );
  }
}
