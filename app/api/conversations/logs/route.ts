import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const conversationId =
      request.nextUrl.searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: "conversationId is required",
        },
        { status: 400 }
      );
    }

    const { data: messages, error: messagesError } =
      await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", {
          ascending: true,
        });

    if (messagesError) {
      throw new Error(messagesError.message);
    }

    const { data: logs, error: logsError } =
      await supabase
        .from("agent_logs")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", {
          ascending: true,
        });

    if (logsError) {
      throw new Error(logsError.message);
    }

    return NextResponse.json({
      success: true,
      conversationId,
      messages: messages ?? [],
      logs: logs ?? [],
    });
  } catch (error) {
    console.error("Conversation logs API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load conversation data",
      },
      { status: 500 }
    );
  }
}