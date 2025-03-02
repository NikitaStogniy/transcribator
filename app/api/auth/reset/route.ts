import { NextResponse } from "next/server";
import { passwordUtils } from "@/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const testEmail = "simple@test.com";
    const testPassword = "password123";

    console.log("DEBUG: Starting test user reset with", {
      testEmail,
      passwordLength: testPassword.length,
    });

    // Сначала удаляем пользователя, если он существует
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (existingUser) {
      // Удаляем связанные записи
      await prisma.account.deleteMany({
        where: { userId: existingUser.id },
      });

      await prisma.session.deleteMany({
        where: { userId: existingUser.id },
      });

      await prisma.user.delete({
        where: { id: existingUser.id },
      });

      console.log("DEBUG: Existing test user deleted", existingUser.id);
    } else {
      console.log("DEBUG: No existing user found with email", testEmail);
    }

    // Создаем простой хеш пароля и подробно логируем его
    console.log("DEBUG: Attempting to hash password", {
      passwordType: typeof testPassword,
      passwordLength: testPassword.length,
    });

    const hashedPassword = await passwordUtils.hashPassword(testPassword);

    console.log("DEBUG: Password hash created:", {
      hashType: typeof hashedPassword,
      hashLength: hashedPassword.length,
      hashStart: hashedPassword.substring(0, 10) + "...",
    });

    // Проверяем хеш сразу и подробно логируем результат
    console.log("DEBUG: Verifying password immediately after hashing");
    const validHash = await passwordUtils.verifyPassword(
      testPassword,
      hashedPassword
    );
    console.log("DEBUG: Password verify result:", validHash);

    // Создаем нового пользователя
    console.log("DEBUG: Creating new user with hash");
    const newUser = await prisma.user.create({
      data: {
        name: "Simple Test User",
        email: testEmail,
        password: hashedPassword,
      },
    });

    console.log("DEBUG: New test user created:", newUser.id);

    // Сразу проверяем возможность получить пользователя из базы
    console.log("DEBUG: Verifying user was properly saved");
    const savedUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    console.log("DEBUG: Retrieved user from database:", {
      id: savedUser?.id,
      email: savedUser?.email,
      passwordExists: !!savedUser?.password,
      passwordLength: savedUser?.password?.length,
      passwordStartsWith: savedUser?.password?.substring(0, 10) + "...",
    });

    // Проверяем хеш пользователя из базы
    if (savedUser?.password) {
      console.log("DEBUG: Verifying password with hash from database");
      const dbHashValid = await passwordUtils.verifyPassword(
        testPassword,
        savedUser.password
      );
      console.log("DEBUG: Password verify with DB hash result:", dbHashValid);
    }

    return NextResponse.json({
      success: true,
      message: "Test user reset successfully",
      user: {
        id: newUser.id,
        email: testEmail,
      },
      testPassword,
      hashVerified: validHash,
      dbSaved: !!savedUser,
    });
  } catch (error) {
    console.error("Error resetting test user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset test user",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
