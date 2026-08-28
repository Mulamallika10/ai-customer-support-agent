import { supabase } from "@/lib/supabase";

export async function createConversation(
  customerId?: string | null,
  title = "New Support Request"
) {
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      customer_id: customerId ?? null,
      title,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create conversation: ${error.message}`
    );
  }

  return data;
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to save message: ${error.message}`
    );
  }

  return data;
}

export async function getConversation(
  conversationId: string
) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to get conversation: ${error.message}`
    );
  }

  return data;
}

export async function getConversationMessages(
  conversationId: string
) {
  const { data, error } = await supabase
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
    throw new Error(
      `Failed to get messages: ${error.message}`
    );
  }

  return data ?? [];
}