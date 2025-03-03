import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const teamId = url.searchParams.get("teamId") as string;

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    // Verify team membership
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

    // Get team invites
    const invites = await prisma.teamInvite.findMany({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error("Error fetching team invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch team invites" },
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

    // Get request body
    const { teamId, email, role } = await request.json();

    if (!teamId || !email || !role) {
      return NextResponse.json(
        { error: "Team ID, email, and role are required" },
        { status: 400 }
      );
    }

    // Verify team membership and admin role
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

    if (teamMember.role !== "admin") {
      return NextResponse.json(
        { error: "Only team admins can create invites" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Check if an invite already exists for this email and team
    const existingInvite = await prisma.teamInvite.findFirst({
      where: {
        teamId,
        email,
        status: "pending",
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "An invite already exists for this email" },
        { status: 400 }
      );
    }

    // If user exists, check if they are already a member of the team
    if (existingUser) {
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId: existingUser.id,
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
    }

    // Create a new invite
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invite = await prisma.teamInvite.create({
      data: {
        teamId,
        email,
        role,
        status: "pending",
        expiresAt,
      },
    });

    // In a real application, you would send an email here
    // For now, we'll just return the invite with a token that can be used to accept it
    return NextResponse.json({
      invite,
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.id}`,
    });
  } catch (error) {
    console.error("Error creating team invite:", error);
    return NextResponse.json(
      { error: "Failed to create team invite" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const inviteId = url.searchParams.get("id") as string;

    if (!inviteId) {
      return NextResponse.json(
        { error: "Invite ID is required" },
        { status: 400 }
      );
    }

    // Get the invite to check team membership
    const invite = await prisma.teamInvite.findUnique({
      where: {
        id: inviteId,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Verify team membership and admin role
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId: invite.teamId,
        },
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      );
    }

    if (teamMember.role !== "admin") {
      return NextResponse.json(
        { error: "Only team admins can delete invites" },
        { status: 403 }
      );
    }

    // Delete the invite
    await prisma.teamInvite.delete({
      where: {
        id: inviteId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team invite:", error);
    return NextResponse.json(
      { error: "Failed to delete team invite" },
      { status: 500 }
    );
  }
}

// Route to resend an invite
export async function PATCH(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Invite ID is required" },
        { status: 400 }
      );
    }

    // Get the invite to check team membership
    const invite = await prisma.teamInvite.findUnique({
      where: {
        id,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Verify team membership and admin role
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId: invite.teamId,
        },
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      );
    }

    if (teamMember.role !== "admin") {
      return NextResponse.json(
        { error: "Only team admins can resend invites" },
        { status: 403 }
      );
    }

    // Update the invite with a new expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const updatedInvite = await prisma.teamInvite.update({
      where: {
        id,
      },
      data: {
        status: "pending",
        expiresAt,
      },
    });

    // In a real application, you would send an email here
    return NextResponse.json({
      invite: updatedInvite,
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${updatedInvite.id}`,
    });
  } catch (error) {
    console.error("Error resending team invite:", error);
    return NextResponse.json(
      { error: "Failed to resend team invite" },
      { status: 500 }
    );
  }
}
