import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating a file
const createFileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().optional(),
  size: z.number().optional(),
  teamId: z.string(),
});

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();

    // Log the session for debugging
    console.log("API /files session:", !!session?.user, session?.user?.id);

    if (!session?.user) {
      console.log("API /files: Unauthorized - no session user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get parameters from the URL query
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    // Validate required parameters
    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    // Reject requests with invalid teamId
    if (teamId === "default" || teamId === "") {
      console.log("API /files: Invalid team ID:", teamId);
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    // Check if user is member of the team
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "You don't have access to this team" },
        { status: 403 }
      );
    }

    // Get files from database
    const files = await prisma.file.findMany({
      where: {
        teamId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const result = createFileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, type, size, teamId } = result.data;

    // Check if user is member of the team
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "You don't have access to this team" },
        { status: 403 }
      );
    }

    // Create file in database
    const file = await prisma.file.create({
      data: {
        name,
        type: type || "audio/mp3",
        size: size || 0,
        status: "pending",
        teamId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json(
      { error: "Failed to create file" },
      { status: 500 }
    );
  }
}
