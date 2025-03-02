import { NextResponse } from "next/server";

// Mock data for documents
const documents = [
  {
    id: "doc-1",
    title: "Team Brainstorming Session",
    meetingId: "meeting-1",
    fileId: "file-1",
    createdAt: "2023-06-15T16:00:00Z",
    updatedAt: "2023-06-15T16:30:00Z",
    summary:
      "The team discussed new product features and prioritized them for the next quarter. Key decisions included focusing on user experience improvements and adding a data export functionality.",
    teamId: "team-1",
    createdBy: "user-1",
  },
  {
    id: "doc-2",
    title: "Product Review Meeting",
    meetingId: "meeting-2",
    fileId: "file-2",
    createdAt: "2023-07-22T11:45:00Z",
    updatedAt: "2023-07-22T12:15:00Z",
    summary:
      "The product team reviewed the latest release and identified some issues with the mobile responsiveness. Action items include fixing the navigation menu on mobile and improving load times.",
    teamId: "team-1",
    createdBy: "user-2",
  },
  {
    id: "doc-3",
    title: "Weekly Sync Meeting",
    meetingId: "meeting-3",
    fileId: "file-3",
    createdAt: "2023-08-05T10:30:00Z",
    updatedAt: "2023-08-05T10:45:00Z",
    summary:
      "Weekly status update with progress reports from each team member. No blockers identified, and all tasks are on track for the sprint deadline.",
    teamId: "team-1",
    createdBy: "user-1",
  },
  {
    id: "doc-4",
    title: "Customer Feedback Session",
    meetingId: "meeting-4",
    fileId: "file-4",
    createdAt: "2023-08-10T17:15:00Z",
    updatedAt: "2023-08-10T17:45:00Z",
    summary:
      "Meeting with key customer accounts to gather feedback on the new dashboard features. Customers expressed satisfaction with the changes but requested additional reporting capabilities.",
    teamId: "team-1",
    createdBy: "user-3",
  },
  {
    id: "doc-5",
    title: "Strategic Planning Session",
    meetingId: "meeting-5",
    fileId: "file-5",
    createdAt: "2023-08-18T14:50:00Z",
    updatedAt: "2023-08-18T15:20:00Z",
    summary:
      "Leadership team discussed long-term goals and market positioning. Decision made to expand into the enterprise market segment in the next fiscal year.",
    teamId: "team-1",
    createdBy: "user-2",
  },
  {
    id: "doc-6",
    title: "Quarterly Review",
    meetingId: "meeting-6",
    fileId: "file-6",
    createdAt: "2023-09-01T13:00:00Z",
    updatedAt: "2023-09-01T13:30:00Z",
    summary:
      "Financial review of Q3 performance. Revenue targets were met, but expenses were higher than projected. Team to focus on cost optimization in Q4.",
    teamId: "team-2",
    createdBy: "user-1",
  },
  {
    id: "doc-7",
    title: "Marketing Brainstorm",
    meetingId: "meeting-7",
    fileId: "file-7",
    createdAt: "2023-09-10T15:30:00Z",
    updatedAt: "2023-09-10T16:00:00Z",
    summary:
      "Marketing team brainstormed campaign ideas for the holiday season. Decision to focus on social media and targeted email campaigns for existing customers.",
    teamId: "team-2",
    createdBy: "user-3",
  },
];

export async function GET(request: Request) {
  // Get parameters from the URL query
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const fileId = searchParams.get("fileId");

  // Apply filters if provided
  let filteredDocuments = documents;

  if (teamId) {
    filteredDocuments = filteredDocuments.filter(
      (doc) => doc.teamId === teamId
    );
  }

  if (fileId) {
    filteredDocuments = filteredDocuments.filter(
      (doc) => doc.fileId === fileId
    );
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(filteredDocuments);
}

export async function POST(request: Request) {
  // Handle creating a new document (mock)
  try {
    const body = await request.json();

    // Validate the required fields
    if (!body.title || !body.fileId || !body.teamId || !body.createdBy) {
      return NextResponse.json(
        { error: "title, fileId, teamId, and createdBy are required" },
        { status: 400 }
      );
    }

    // Create a new document object
    const now = new Date().toISOString();
    const newDocument = {
      id: `doc-${documents.length + 1}`,
      title: body.title,
      meetingId: body.meetingId || `meeting-${documents.length + 1}`,
      fileId: body.fileId,
      createdAt: now,
      updatedAt: now,
      summary: body.summary || "No summary available yet.",
      teamId: body.teamId,
      createdBy: body.createdBy,
    };

    // In a real app, we would save this to a database
    // For the mock, we'll just return the new document
    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
