import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTranscription, updateSegment } from "@/lib/db/transcriptions";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; segmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id, segmentId } = params;
    const transcription = await getTranscription(id);

    if (!transcription) {
      return new Response(
        JSON.stringify({ error: "Transcription not found" }),
        { status: 404 }
      );
    }

    if (transcription.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text is required and must be a string" }),
        { status: 400 }
      );
    }

    const updatedSegment = await updateSegment(segmentId, { text });

    return new Response(JSON.stringify(updatedSegment), { status: 200 });
  } catch (error) {
    console.error("Error updating segment:", error);
    return new Response(JSON.stringify({ error: "Failed to update segment" }), {
      status: 500,
    });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; segmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = params;
    const transcription = await getTranscription(id);

    if (!transcription) {
      return new Response(
        JSON.stringify({ error: "Transcription not found" }),
        { status: 404 }
      );
    }

    if (transcription.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    const segment = transcription.segments.find(
      (s) => s.id === params.segmentId
    );

    if (!segment) {
      return new Response(JSON.stringify({ error: "Segment not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(segment), { status: 200 });
  } catch (error) {
    console.error("Error getting segment:", error);
    return new Response(JSON.stringify({ error: "Failed to get segment" }), {
      status: 500,
    });
  }
}
