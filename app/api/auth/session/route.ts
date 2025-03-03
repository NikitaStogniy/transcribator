import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Get the session
    const session = await auth();

    // Return simplified session info (avoid exposing sensitive data)
    return NextResponse.json({
      authenticated: !!session?.user,
      userId: session?.user?.id,
      userName: session?.user?.name,
      userEmail: session?.user?.email,
    });
  } catch (error) {
    console.error("Error in session debug API:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}
