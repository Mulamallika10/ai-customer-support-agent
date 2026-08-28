import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    console.log("AUTH USER:", user);
    console.log("AUTH ERROR:", error);

    if (error || !user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          error:
            error?.message ||
            "Auth session missing!",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,

        user: {
          id: user.id,
          email: user.email,
        },

        message:
          "Supabase authentication is working!",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "AUTH TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error:
          error instanceof Error
            ? error.message
            : "Authentication test failed",
      },
      {
        status: 500,
      }
    );
  }
}