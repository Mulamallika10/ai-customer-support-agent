import { supabase } from "@/lib/supabase";

export type AgentLogStatus =
  | "started"
  | "success"
  | "error"
  | "retry";

interface CreateAgentLogParams {
  conversationId: string;
  step: string;
  toolName?: string | null;
  input?: unknown;
  output?: unknown;
  status: AgentLogStatus;
  errorMessage?: string | null;
}

export async function createAgentLog({
  conversationId,
  step,
  toolName = null,
  input = null,
  output = null,
  status,
  errorMessage = null,
}: CreateAgentLogParams) {

  try {

    if (!conversationId) {
      console.error(
        "❌ conversationId missing in agent log",
        {
          step,
          toolName,
          status,
        }
      );

      return null;
    }

    console.log(
      "📝 Creating agent log:",
      {
        conversationId,
        step,
        toolName,
        status,
      }
    );

    const { data, error } =
      await supabase
        .from("agent_logs")
        .insert({
          conversation_id:
            conversationId,

          step,

          tool_name:
            toolName,

          input,

          output,

          status,

          error_message:
            errorMessage,
        })
        .select()
        .single();

    if (error) {

      console.error(
        "❌ Failed to save agent log:",
        error.message
      );

      return null;
    }

    console.log(
      "✅ Agent log saved:",
      {
        id: data.id,

        conversation_id:
          data.conversation_id,

        step:
          data.step,

        tool_name:
          data.tool_name,

        status:
          data.status,
      }
    );

    return data;

  } catch (error) {

    console.error(
      "❌ Agent logging error:",
      error
    );

    return null;
  }
}