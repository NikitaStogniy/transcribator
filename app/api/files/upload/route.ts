import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadFile } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { uploadToAssemblyAI, startTranscription } from "@/lib/assembly";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    let teamId = formData.get("teamId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // If no teamId is provided, get the user's default team
    if (!teamId) {
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
        return NextResponse.json(
          {
            error:
              "No default team found for user. Please create a team first.",
          },
          { status: 404 }
        );
      }

      teamId = userTeam.teamId;
    }

    // First check if the team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
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
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      );
    }

    // Upload file to Vercel Blob
    const blobResult = await uploadFile(file, teamId, session.user.id);

    // Save file metadata to database
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
    ];

    if (audioFileTypes.includes(file.type)) {
      try {
        // Update file status to processing
        await prisma.file.update({
          where: { id: dbFile.id },
          data: { status: "processing" },
        });

        // Upload to Assembly AI
        const assemblyAIUrl = await uploadToAssemblyAI(file);

        // Start transcription
        const transcriptionId = await startTranscription(assemblyAIUrl);

        // Create an initial transcription record
        await prisma.transcription.create({
          data: {
            fileId: dbFile.id,
            content: { transcriptionId, status: "processing" },
          },
        });

        // In a real application, you would use a background job or webhook
        // to poll for the transcription completion and update the database
      } catch (transcriptionError) {
        console.error("Transcription failed:", transcriptionError);

        // Update file status to error
        await prisma.file.update({
          where: { id: dbFile.id },
          data: { status: "error" },
        });

        // Still return success for the file upload
        return NextResponse.json({
          fileId: dbFile.id,
          message: "File uploaded successfully but transcription failed",
          transcriptionError:
            transcriptionError instanceof Error
              ? transcriptionError.message
              : "Unknown transcription error",
        });
      }
    }

    return NextResponse.json({
      fileId: dbFile.id,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
