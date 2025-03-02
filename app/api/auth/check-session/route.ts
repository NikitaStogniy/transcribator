import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Получаем сессию
    const session = await auth();

    if (session) {
      return NextResponse.json({
        loggedIn: true,
        session,
      });
    } else {
      return NextResponse.json({
        loggedIn: false,
      });
    }
  } catch (error) {
    return NextResponse.json({
      loggedIn: false,
      error: String(error),
    });
  }
}
