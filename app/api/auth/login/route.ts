import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { loginSchema, loginUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Email and password are required.",
          },
        },
        { status: 400 },
      );
    }

    const result = await loginUser(parsed.data.email, parsed.data.password);
    if (!result) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid email or password.",
          },
        },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ user: result.user }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Unable to sign in right now.",
        },
      },
      { status: 500 },
    );
  }
}
