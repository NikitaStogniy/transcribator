import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating a team member
const createTeamMemberSchema = z.object({
  userId: z.string(),
  teamId: z.string(),
  role: z.enum(["admin", "editor", "viewer"]),
  email: z.string().email().optional(),
  name: z.string().optional(),
  image: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get parameters from the URL query
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const membersOnly = searchParams.get("membersOnly") === "true";

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

    // Get team members from database
    const members = await prisma.teamMember.findMany({
      where: {
        teamId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Format the response
    const formattedMembers = members.map((member: any) => ({
      id: member.id,
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
      role: member.role,
      joinedAt: member.createdAt,
      teamId: member.teamId,
    }));

    if (membersOnly) {
      return NextResponse.json(formattedMembers);
    } else {
      // Get team details
      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
        },
      });

      return NextResponse.json({
        members: formattedMembers,
        team,
      });
    }
  } catch (error) {
    console.error("Error fetching team data:", error);
    return NextResponse.json(
      { error: "Failed to fetch team data" },
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
    const result = createTeamMemberSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }

    const { userId, teamId, role, email, name, image } = result.data;

    // Check if user making the request is an admin of the team
    const requesterTeamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId,
        },
      },
    });

    if (!requesterTeamMember || requesterTeamMember.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to add members to this team" },
        { status: 403 }
      );
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user being added exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a member of the team
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      );
    }

    // Add user to team
    const teamMember = await prisma.teamMember.create({
      data: {
        userId,
        teamId,
        role,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Format the response
    const formattedMember = {
      id: teamMember.id,
      userId: teamMember.userId,
      name: teamMember.user.name,
      email: teamMember.user.email,
      image: teamMember.user.image,
      role: teamMember.role,
      joinedAt: teamMember.createdAt,
      teamId: teamMember.teamId,
    };

    return NextResponse.json(formattedMember, { status: 201 });
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}
