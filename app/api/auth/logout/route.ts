import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";

export async function GET() {
  try {
    console.log("LOGOUT: Attempting to sign out");

    // Получаем текущую сессию для логирования
    const session = await auth();
    console.log("LOGOUT: Current session before logout:", {
      active: !!session,
      user: session?.user?.email,
    });

    // Вызываем signOut
    await signOut({ redirect: false });

    console.log("LOGOUT: Sign out successful");

    return NextResponse.json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    console.error("LOGOUT: Error during sign out:", error);

    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}
