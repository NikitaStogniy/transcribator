import { NextResponse } from "next/server";

// Mock data for team members
const teamMembers = [
  {
    id: "member-1",
    userId: "user-1",
    name: "John Doe",
    email: "john.doe@example.com",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    role: "admin",
    joinedAt: "2023-01-10T09:00:00Z",
    teamId: "team-1",
  },
  {
    id: "member-2",
    userId: "user-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    role: "editor",
    joinedAt: "2023-02-15T10:30:00Z",
    teamId: "team-1",
  },
  {
    id: "member-3",
    userId: "user-3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    role: "viewer",
    joinedAt: "2023-03-20T14:15:00Z",
    teamId: "team-1",
  },
  {
    id: "member-4",
    userId: "user-4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    role: "editor",
    joinedAt: "2023-04-05T11:45:00Z",
    teamId: "team-1",
  },
  {
    id: "member-5",
    userId: "user-5",
    name: "Alex Wilson",
    email: "alex.wilson@example.com",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    role: "viewer",
    joinedAt: "2023-05-12T08:30:00Z",
    teamId: "team-1",
  },
  {
    id: "member-6",
    userId: "user-1",
    name: "John Doe",
    email: "john.doe@example.com",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    role: "admin",
    joinedAt: "2023-01-15T09:30:00Z",
    teamId: "team-2",
  },
  {
    id: "member-7",
    userId: "user-3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    role: "editor",
    joinedAt: "2023-02-20T13:45:00Z",
    teamId: "team-2",
  },
];

// Mock data for teams
const teams = [
  {
    id: "team-1",
    name: "Transcription Team",
    createdAt: "2023-01-01T00:00:00Z",
    ownerId: "user-1",
  },
  {
    id: "team-2",
    name: "Research Group",
    createdAt: "2023-02-01T00:00:00Z",
    ownerId: "user-1",
  },
];

export async function GET(request: Request) {
  // Get teamId from the URL query parameters
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const membersOnly = searchParams.get("membersOnly") === "true";

  // Filter team members by teamId if provided
  const filteredMembers = teamId
    ? teamMembers.filter((member) => member.teamId === teamId)
    : teamMembers;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (membersOnly) {
    return NextResponse.json(filteredMembers);
  } else {
    // Get team details
    const teamDetails = teamId
      ? teams.find((team) => team.id === teamId)
      : undefined;

    return NextResponse.json({
      members: filteredMembers,
      team: teamDetails,
    });
  }
}

export async function POST(request: Request) {
  // Handle adding a new team member (mock)
  try {
    const body = await request.json();

    // Validate the required fields
    if (!body.userId || !body.teamId || !body.role) {
      return NextResponse.json(
        { error: "userId, teamId, and role are required" },
        { status: 400 }
      );
    }

    // Check if team exists
    const teamExists = teams.some((team) => team.id === body.teamId);
    if (!teamExists) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Create a new team member object
    const newMember = {
      id: `member-${teamMembers.length + 1}`,
      userId: body.userId,
      name: body.name || "New User",
      email: body.email || "user@example.com",
      image: body.image,
      role: body.role,
      joinedAt: new Date().toISOString(),
      teamId: body.teamId,
    };

    // In a real app, we would save this to a database
    // For the mock, we'll just return the new member
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
