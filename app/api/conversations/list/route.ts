import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      conversations: data ?? [],
    });
  } catch (error) {
    console.error(
      "Conversation list error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load conversations",
      },
      { status: 500 }
    );
  }
}