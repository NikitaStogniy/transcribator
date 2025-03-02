import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating a document
const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  content: z.any().optional(),
  fileId: z.string().optional(),
  teamId: z.string(),
});

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();

    // Log the session for debugging
    console.log("API /documents session:", !!session?.user, session?.user?.id);

    if (!session?.user) {
      console.log("API /documents: Unauthorized - no session user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get parameters from the URL query
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const fileId = searchParams.get("fileId");

    // Validate required parameters
    if (!teamId) {
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
      return NextResponse.json(
        { error: "You don't have access to this team" },
        { status: 403 }
      );
    }

    // Build query
    const query: any = {
      where: {
        teamId,
      },
      orderBy: {
        updatedAt: "desc" as const,
      },
    };

    // Add fileId filter if provided
    if (fileId) {
      query.where.fileId = fileId;
    }

    // Get documents
    const documents = await prisma.document.findMany(query);

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
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
    const result = createDocumentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }

    const { title, summary, content, fileId, teamId } = result.data;

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
        { error: "You don't have access to this team" },
        { status: 403 }
      );
    }

    // If fileId is provided, check if file exists and belongs to the team
    if (fileId) {
      const file = await prisma.file.findUnique({
        where: {
          id: fileId,
          teamId,
        },
      });

      if (!file) {
        return NextResponse.json(
          { error: "File not found or doesn't belong to the team" },
          { status: 404 }
        );
      }
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        title,
        summary,
        content: content || {},
        fileId,
        teamId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
