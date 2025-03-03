import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTranscriptionStatus } from "@/lib/assembly";

// Helper function for consistent logging
function logInfo(area: string, message: string, data?: any) {
  const logMessage = `[TRANSCRIPTION_FILE_API:${area}] ${message}`;
  console.log(logMessage, data ? data : "");
}

function logError(area: string, message: string, error: any) {
  const logMessage = `[TRANSCRIPTION_FILE_API:${area}:ERROR] ${message}`;
  console.error(logMessage, error);
}

// GET handler - Fetch a specific transcription and check its status
export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId;
    logInfo("GET", `Fetching transcription for file ${fileId}`);

    const session = await auth();
    if (!session?.user) {
      logInfo("GET", "Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the file and verify team membership
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        transcriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!file) {
      logInfo("GET", `File ${fileId} not found`);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if user is member of the team
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId: file.teamId,
        },
      },
    });

    if (!teamMember) {
      logInfo(
        "GET",
        `User ${session.user.id} is not a member of team ${file.teamId}`
      );
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      );
    }

    if (!file.transcriptions || file.transcriptions.length === 0) {
      logInfo("GET", `No transcription found for file ${fileId}`);
      return NextResponse.json(
        { error: "No transcription found for this file" },
        { status: 404 }
      );
    }

    const transcription = file.transcriptions[0];
    const transcriptionContent = transcription.content as any;

    // If it's already completed or in error state, just return the current status
    if (file.status === "completed" || file.status === "error") {
      logInfo(
        "GET",
        `File ${fileId} transcription is already in final state: ${file.status}`
      );
      return NextResponse.json({
        id: transcription.id,
        fileId: transcription.fileId,
        content: transcription.content,
        status: file.status,
        fileName: file.fileName,
        createdAt: transcription.createdAt,
        updatedAt: transcription.updatedAt,
      });
    }

    // If it's in processing state, check the latest status
    if (file.status === "processing" && transcriptionContent.transcriptionId) {
      try {
        logInfo(
          "GET",
          `Checking status of transcription ${transcriptionContent.transcriptionId}`
        );
        const transcriptionStatus = await getTranscriptionStatus(
          transcriptionContent.transcriptionId
        );

        logInfo(
          "GET",
          `Received status: ${transcriptionStatus.status}`,
          transcriptionStatus
        );

        // Update the transcription and file status based on the result
        if (transcriptionStatus.status === "completed") {
          logInfo(
            "GET",
            `Transcription ${transcriptionContent.transcriptionId} is complete, updating database`
          );

          // Update the transcription content
          const updatedTranscription = await prisma.transcription.update({
            where: { id: transcription.id },
            data: {
              content: {
                ...transcriptionContent,
                status: "completed",
                text: transcriptionStatus.text,
                words: transcriptionStatus.words,
                utterances: transcriptionStatus.utterances,
              },
            },
          });

          // Update the file status
          await prisma.file.update({
            where: { id: fileId },
            data: { status: "completed" },
          });

          return NextResponse.json({
            id: updatedTranscription.id,
            fileId: updatedTranscription.fileId,
            content: updatedTranscription.content,
            status: "completed",
            fileName: file.fileName,
            createdAt: updatedTranscription.createdAt,
            updatedAt: updatedTranscription.updatedAt,
          });
        } else if (transcriptionStatus.status === "error") {
          logInfo(
            "GET",
            `Transcription ${transcriptionContent.transcriptionId} failed, updating database`
          );

          // Update the transcription content
          const updatedTranscription = await prisma.transcription.update({
            where: { id: transcription.id },
            data: {
              content: {
                ...transcriptionContent,
                status: "error",
                error: transcriptionStatus.error,
              },
            },
          });

          // Update the file status
          await prisma.file.update({
            where: { id: fileId },
            data: { status: "error" },
          });

          return NextResponse.json({
            id: updatedTranscription.id,
            fileId: updatedTranscription.fileId,
            content: updatedTranscription.content,
            status: "error",
            fileName: file.fileName,
            createdAt: updatedTranscription.createdAt,
            updatedAt: updatedTranscription.updatedAt,
            error: transcriptionStatus.error,
          });
        }
      } catch (checkError) {
        logError(
          "GET",
          `Error checking transcription status for file ${fileId}`,
          checkError
        );
        // Don't fail the request if status check fails, just return the current data
      }
    }

    // Return the current state (pending or processing)
    return NextResponse.json({
      id: transcription.id,
      fileId: transcription.fileId,
      content: transcription.content,
      status: file.status,
      fileName: file.fileName,
      createdAt: transcription.createdAt,
      updatedAt: transcription.updatedAt,
    });
  } catch (error) {
    logError("GET", "Failed to fetch transcription", error);
    return NextResponse.json(
      { error: "Failed to fetch transcription" },
      { status: 500 }
    );
  }
}
