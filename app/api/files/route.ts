import { NextResponse } from "next/server";

// Mock data for files
const files = [
  {
    id: "file-1",
    name: "Meeting-2023-06-15.mp3",
    type: "audio/mp3",
    size: 24500000,
    uploadedAt: "2023-06-15T14:30:00Z",
    status: "completed",
    uploadedBy: "user-1",
    teamId: "team-1",
  },
  {
    id: "file-2",
    name: "ProductReview-2023-07-22.mp3",
    type: "audio/mp3",
    size: 32000000,
    uploadedAt: "2023-07-22T10:15:00Z",
    status: "completed",
    uploadedBy: "user-2",
    teamId: "team-1",
  },
  {
    id: "file-3",
    name: "WeeklySync-2023-08-05.mp3",
    type: "audio/mp3",
    size: 18000000,
    uploadedAt: "2023-08-05T09:00:00Z",
    status: "processing",
    uploadedBy: "user-1",
    teamId: "team-1",
  },
  {
    id: "file-4",
    name: "CustomerFeedback-2023-08-10.mp3",
    type: "audio/mp3",
    size: 27000000,
    uploadedAt: "2023-08-10T15:45:00Z",
    status: "pending",
    uploadedBy: "user-3",
    teamId: "team-1",
  },
  {
    id: "file-5",
    name: "StrategicPlanning-2023-08-18.mp3",
    type: "audio/mp3",
    size: 45000000,
    uploadedAt: "2023-08-18T13:20:00Z",
    status: "error",
    uploadedBy: "user-2",
    teamId: "team-1",
  },
  {
    id: "file-6",
    name: "Q3Review-2023-09-01.mp3",
    type: "audio/mp3",
    size: 36000000,
    uploadedAt: "2023-09-01T11:30:00Z",
    status: "pending",
    uploadedBy: "user-1",
    teamId: "team-2",
  },
  {
    id: "file-7",
    name: "MarketingBrainstorm-2023-09-10.mp3",
    type: "audio/mp3",
    size: 29000000,
    uploadedAt: "2023-09-10T14:00:00Z",
    status: "completed",
    uploadedBy: "user-3",
    teamId: "team-2",
  },
];

export async function GET(request: Request) {
  // Get teamId from the URL query parameters
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  // Filter files by teamId if provided
  const filteredFiles = teamId
    ? files.filter((file) => file.teamId === teamId)
    : files;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(filteredFiles);
}

export async function POST(request: Request) {
  // Handle file upload (mock)
  try {
    const body = await request.json();

    // Validate the required fields
    if (!body.name || !body.teamId) {
      return NextResponse.json(
        { error: "Name and teamId are required" },
        { status: 400 }
      );
    }

    // Create a new file object
    const newFile = {
      id: `file-${files.length + 1}`,
      name: body.name,
      type: body.type || "audio/mp3",
      size: body.size || 0,
      uploadedAt: new Date().toISOString(),
      status: "pending",
      uploadedBy: body.uploadedBy || "user-1",
      teamId: body.teamId,
    };

    // In a real app, we would save this to a database
    // For the mock, we'll just return the new file
    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
