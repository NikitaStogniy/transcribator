import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadFile } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { uploadToAssemblyAI, startTranscription } from "@/lib/assembly";

// Helper function for consistent logging
function logInfo(area: string, message: string, data?: any) {
  const logMessage = `[FILEUPLOAD:${area}] ${message}`;
  console.log(logMessage, data ? data : "");
}

function logError(area: string, message: string, error: any) {
  const logMessage = `[FILEUPLOAD:${area}:ERROR] ${message}`;
  console.error(logMessage, error);
}

export async function POST(request: Request) {
  const requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  try {
    // Check authentication
    logInfo("START", `New upload request ${requestId}`);
    const session = await auth();
    if (!session?.user) {
      logInfo("AUTH", `Unauthorized access attempt ${requestId}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logInfo("AUTH", `Authenticated user: ${session.user.id}`);

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    let teamId = formData.get("teamId") as string;

    if (!file) {
      logInfo("VALIDATION", "No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    logInfo(
      "FILE",
      `File received: ${file.name}, size: ${file.size}, type: ${file.type}`
    );

    // If no teamId is provided, get the user's default team
    if (!teamId) {
      logInfo("TEAM", "No teamId provided, getting user's default team");
      // Find user's team where they are an admin (their personal team)
      const userTeam = await prisma.teamMember.findFirst({
        where: {
          userId: session.user.id,
          role: "admin",
        },
        include: { team: true },
        orderBy: { createdAt: "asc" }, // Get their first/oldest team (likely their personal one)
      });

      if (!userTeam) {
        logInfo("TEAM", "No default team found for user");
        return NextResponse.json(
          {
            error:
              "No default team found for user. Please create a team first.",
          },
          { status: 404 }
        );
      }

      teamId = userTeam.teamId;
      logInfo("TEAM", `Using default team: ${teamId}`);
    }

    // First check if the team exists
    logInfo("TEAM", `Verifying team: ${teamId}`);
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      logInfo("TEAM", `Team not found: ${teamId}`);
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is member of the team
    logInfo("TEAM", `Checking user membership in team: ${teamId}`);
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
        "TEAM",
        `User ${session.user.id} is not a member of team ${teamId}`
      );
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      );
    }

    logInfo("TEAM", `User is a ${teamMember.role} of team ${teamId}`);

    // Upload file to Vercel Blob
    logInfo("STORAGE", `Starting upload to Vercel Blob`);
    const blobResult = await uploadFile(file, teamId, session.user.id);
    logInfo("STORAGE", `File uploaded to Blob: ${blobResult.url}`);

    // Save file metadata to database
    logInfo("DATABASE", `Saving file metadata to database`);
    const dbFile = await prisma.file.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        blobUrl: blobResult.url,
        status: "pending",
        userId: session.user.id,
        teamId,
      },
    });
    logInfo("DATABASE", `File record created with ID: ${dbFile.id}`);

    // If it's an audio file, start the transcription process
    const audioFileTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/ogg",
      "audio/webm",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "audio/x-m4a",
    ];

    if (audioFileTypes.includes(file.type)) {
      logInfo(
        "TRANSCRIPTION",
        `File is audio/video type: ${file.type}, starting transcription process`
      );
      try {
        // Update file status to processing
        logInfo("DATABASE", `Updating file status to processing`);
        await prisma.file.update({
          where: { id: dbFile.id },
          data: { status: "processing" },
        });

        // Upload to Assembly AI
        logInfo("TRANSCRIPTION", `Uploading file to AssemblyAI`);
        const assemblyAIUrl = await uploadToAssemblyAI(file);
        logInfo(
          "TRANSCRIPTION",
          `File uploaded to AssemblyAI: ${assemblyAIUrl}`
        );

        // Start transcription
        logInfo("TRANSCRIPTION", `Starting AssemblyAI transcription`);
        const transcriptionId = await startTranscription(assemblyAIUrl);
        logInfo(
          "TRANSCRIPTION",
          `Transcription started with ID: ${transcriptionId}`
        );

        // Create an initial transcription record
        logInfo("DATABASE", `Creating transcription record`);
        const transcription = await prisma.transcription.create({
          data: {
            fileId: dbFile.id,
            content: { transcriptionId, status: "processing" },
          },
        });
        logInfo(
          "DATABASE",
          `Transcription record created with ID: ${transcription.id}`
        );

        // In a real application, you would use a background job or webhook
        // to poll for the transcription completion and update the database
      } catch (transcriptionError) {
        logError(
          "TRANSCRIPTION",
          `Transcription process failed for file ${dbFile.id}`,
          transcriptionError
        );

        // Update file status to error
        logInfo("DATABASE", `Updating file status to error`);
        await prisma.file.update({
          where: { id: dbFile.id },
          data: { status: "error" },
        });

        // Still return success for the file upload
        logInfo(
          "RESPONSE",
          `Returning partial success (upload succeeded, transcription failed)`
        );
        return NextResponse.json({
          fileId: dbFile.id,
          message: "File uploaded successfully but transcription failed",
          transcriptionError:
            transcriptionError instanceof Error
              ? transcriptionError.message
              : "Unknown transcription error",
        });
      }
    } else {
      logInfo(
        "TRANSCRIPTION",
        `File type ${file.type} is not audio/video, skipping transcription`
      );
    }

    logInfo(
      "COMPLETE",
      `File upload process completed successfully for file ${dbFile.id}`
    );
    return NextResponse.json({
      fileId: dbFile.id,
      message: "File uploaded successfully",
    });
  } catch (error) {
    logError(
      "GENERAL",
      `Unexpected error during file upload ${requestId}`,
      error
    );
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
