import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getTranscription,
  updateTranscriptionStatus,
  saveTranscriptionSegments,
  updateTranscriptionMetadata,
} from "@/lib/db/transcriptions";
import { createAssemblyClient } from "@/lib/assemblyai";

export async function POST(
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

    if (!transcription.assemblyId) {
      return new Response(JSON.stringify({ error: "No AssemblyAI ID found" }), {
        status: 400,
      });
    }

    // Get status from AssemblyAI
    const client = createAssemblyClient();
    const assemblyTranscript = await client.transcripts.get(
      transcription.assemblyId
    );

    // Update status
    await updateTranscriptionStatus(
      id,
      assemblyTranscript.status,
      assemblyTranscript.status === "error"
        ? assemblyTranscript.error
        : undefined
    );

    if (assemblyTranscript.status === "completed") {
      // Save segments
      if (
        assemblyTranscript.utterances &&
        assemblyTranscript.utterances.length > 0
      ) {
        await saveTranscriptionSegments(
          id,
          assemblyTranscript.utterances.map((utterance) => ({
            startTime: utterance.start || 0,
            endTime: utterance.end || 0,
            text: utterance.text || "",
            speaker: utterance.speaker,
            confidence: utterance.confidence || 1,
          }))
        );
      } else if (
        assemblyTranscript.words &&
        assemblyTranscript.words.length > 0
      ) {
        // If no utterances, create one segment from all words
        await saveTranscriptionSegments(id, [
          {
            startTime: assemblyTranscript.words[0].start || 0,
            endTime:
              assemblyTranscript.words[assemblyTranscript.words.length - 1]
                .end || 0,
            text: assemblyTranscript.text || "",
            confidence: assemblyTranscript.confidence || 1,
          },
        ]);
      }

      // Update metadata
      await updateTranscriptionMetadata(id, {
        duration: assemblyTranscript.audio_duration
          ? Number(assemblyTranscript.audio_duration)
          : undefined,
        language: assemblyTranscript.language_code || undefined,
        summary: assemblyTranscript.summary || undefined,
        topics: assemblyTranscript.auto_highlights_result || {},
      });

      // Return updated transcription
      const updatedTranscription = await getTranscription(id);
      return new Response(JSON.stringify(updatedTranscription), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        status: assemblyTranscript.status,
        message: "Transcription is not completed yet",
      }),
      { status: 202 }
    );
  } catch (error) {
    console.error("Error syncing transcription:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to sync transcription",
        details: (error as Error).message,
      }),
      { status: 500 }
    );
  }
}
