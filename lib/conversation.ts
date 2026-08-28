import { createClient } from "@/lib/supabase/server";

// ======================================================
// CREATE CONVERSATION
// ======================================================

export async function createConversation(
  customerId: string,
  title = "New Conversation"
) {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("conversations")
    .insert({
      customer_id: customerId,
      title,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "CREATE CONVERSATION ERROR:",
      error
    );

    throw new Error(
      "Failed to create conversation"
    );
  }

  return data;
}

// ======================================================
// SAVE MESSAGE
// ======================================================

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string
) {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "SAVE MESSAGE ERROR:",
      error
    );

    throw new Error(
      "Failed to save message"
    );
  }

  return data;
}

// ======================================================
// GET CONVERSATION MESSAGES
// ======================================================

export async function getConversationMessages(
  conversationId: string,
  customerId: string
) {
  const supabase = await createClient();

  const {
    data: conversation,
    error: conversationError,
  } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("customer_id", customerId)
    .single();

  if (
    conversationError ||
    !conversation
  ) {
    throw new Error(
      "Conversation not found"
    );
  }

  const {
    data: messages,
    error,
  } = await supabase
    .from("messages")
    .select("*")
    .eq(
      "conversation_id",
      conversationId
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "GET MESSAGES ERROR:",
      error
    );

    throw new Error(
      "Failed to load messages"
    );
  }

  return messages ?? [];
}

// ======================================================
// VERIFY CONVERSATION OWNER
// ======================================================

export async function verifyConversationOwner(
  conversationId: string,
  customerId: string
) {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("customer_id", customerId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

// ======================================================
// SAVE AGENT LOG
// ======================================================

export async function saveAgentLog({
  conversationId,
  step,
  toolName,
  input,
  output,
  status,
  errorMessage,
}: {
  conversationId: string;
  step: string;
  toolName?: string | null;
  input?: any;
  output?: any;
  status: "started" | "success" | "error" | "retry";
  errorMessage?: string | null;
}) {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("agent_logs")
    .insert({
      conversation_id:
        conversationId,

      step,

      tool_name:
        toolName ?? null,

      input:
        input ?? null,

      output:
        output ?? null,

      status,

      error_message:
        errorMessage ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "SAVE AGENT LOG ERROR:",
      error
    );

    throw new Error(
      `Failed to save agent log: ${error.message}`
    );
  }

  return data;
}