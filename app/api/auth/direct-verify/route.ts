import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const testEmail = "simple@test.com";
  const testPassword = "password123";

  console.log("DIRECT-VERIFY: Starting direct password verification test");

  try {
    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    console.log("DIRECT-VERIFY: User found:", !!user);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
      });
    }

    console.log("DIRECT-VERIFY: User password hash:", user.password);

    // Напрямую проверяем пароль через bcryptjs
    const isValid = await compare(testPassword, user.password);

    console.log("DIRECT-VERIFY: Password valid:", isValid);

    return NextResponse.json({
      success: true,
      userExists: true,
      passwordValid: isValid,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("DIRECT-VERIFY: Error:", error);

    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}
