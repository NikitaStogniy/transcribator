import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTranscriptionStatus } from "@/lib/assembly";

// Helper function for consistent logging
function logInfo(area: string, message: string, data?: any) {
  const logMessage = `[TRANSCRIPTION_API:${area}] ${message}`;
  console.log(logMessage, data ? data : "");
}

function logError(area: string, message: string, error: any) {
  const logMessage = `[TRANSCRIPTION_API:${area}:ERROR] ${message}`;
  console.error(logMessage, error);
}

// GET handler - Fetch transcriptions
export async function GET(request: Request) {
  try {
    logInfo("GET", "Fetching transcriptions");
    const session = await auth();
    if (!session?.user) {
      logInfo("GET", "Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const status = searchParams.get("status");

    if (!teamId) {
      logInfo("GET", "No teamId provided");
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    // Check if user is member of the team
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId,
        },
      },
    });

    if (!teamMember) {
      logInfo(
        "GET",
        `User ${session.user.id} is not a member of team ${teamId}`
      );
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      );
    }

    // Get transcriptions with their associated files
    const transcriptions = await prisma.transcription.findMany({
      where: {
        file: {
          teamId,
          ...(status ? { status } : {}),
        },
      },
      include: {
        file: {
          select: {
            fileName: true,
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Map to a more friendly response format
    const mappedTranscriptions = transcriptions.map((transcription: any) => ({
      id: transcription.id,
      fileId: transcription.fileId,
      fileName: transcription.file.fileName,
      content: transcription.content,
      createdAt: transcription.createdAt,
      updatedAt: transcription.updatedAt,
      status: transcription.file.status,
    }));

    logInfo("GET", `Returning ${mappedTranscriptions.length} transcriptions`);
    return NextResponse.json(mappedTranscriptions);
  } catch (error) {
    logError("GET", "Failed to fetch transcriptions", error);
    return NextResponse.json(
      { error: "Failed to fetch transcriptions" },
      { status: 500 }
    );
  }
}

// POST handler - Check and update transcription status
export async function POST(request: Request) {
  try {
    logInfo("POST", "Processing transcription status check request");
    const session = await auth();
    if (!session?.user) {
      logInfo("POST", "Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get body data
    const data = await request.json();
    const { fileId, teamId } = data;

    if (!fileId) {
      logInfo("POST", "No fileId provided");
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    if (!teamId) {
      logInfo("POST", "No teamId provided");
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    // Check if user is member of the team
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId,
        },
      },
    });

    if (!teamMember) {
      logInfo(
        "POST",
        `User ${session.user.id} is not a member of team ${teamId}`
      );
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      );
    }

    // Get the file and its transcription
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
      logInfo("POST", `File ${fileId} not found`);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.teamId !== teamId) {
      logInfo("POST", `File ${fileId} does not belong to team ${teamId}`);
      return NextResponse.json(
        { error: "File does not belong to the specified team" },
        { status: 403 }
      );
    }

    if (file.status !== "processing") {
      logInfo(
        "POST",
        `File ${fileId} is not in processing status (current: ${file.status})`
      );
      return NextResponse.json({
        message: "File is not in processing status",
        status: file.status,
      });
    }

    if (!file.transcriptions || file.transcriptions.length === 0) {
      logInfo("POST", `No transcription found for file ${fileId}`);
      return NextResponse.json(
        { error: "No transcription found for this file" },
        { status: 404 }
      );
    }

    const transcription = file.transcriptions[0];
    const transcriptionContent = transcription.content as any;

    if (!transcriptionContent.transcriptionId) {
      logInfo(
        "POST",
        `No transcriptionId found in transcription content for file ${fileId}`
      );
      return NextResponse.json(
        { error: "No transcription ID found" },
        { status: 404 }
      );
    }

    // Check the status with Assembly AI
    logInfo(
      "POST",
      `Checking status of transcription ${transcriptionContent.transcriptionId}`
    );
    const transcriptionStatus = await getTranscriptionStatus(
      transcriptionContent.transcriptionId
    );

    logInfo(
      "POST",
      `Received status: ${transcriptionStatus.status}`,
      transcriptionStatus
    );

    // Update the transcription and file status based on the result
    if (transcriptionStatus.status === "completed") {
      logInfo(
        "POST",
        `Transcription ${transcriptionContent.transcriptionId} is complete, updating database`
      );

      // Update the transcription content
      await prisma.transcription.update({
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
        message: "Transcription completed",
        status: "completed",
        transcription: {
          id: transcription.id,
          fileId: transcription.fileId,
          text: transcriptionStatus.text,
          status: "completed",
        },
      });
    } else if (transcriptionStatus.status === "error") {
      logInfo(
        "POST",
        `Transcription ${transcriptionContent.transcriptionId} failed, updating database`
      );

      // Update the transcription content
      await prisma.transcription.update({
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
        message: "Transcription failed",
        status: "error",
        error: transcriptionStatus.error,
      });
    } else {
      // Still processing
      logInfo(
        "POST",
        `Transcription ${transcriptionContent.transcriptionId} is still processing`
      );
      return NextResponse.json({
        message: "Transcription is still processing",
        status: transcriptionStatus.status,
      });
    }
  } catch (error) {
    logError("POST", "Failed to check transcription status", error);
    return NextResponse.json(
      { error: "Failed to check transcription status" },
      { status: 500 }
    );
  }
}
