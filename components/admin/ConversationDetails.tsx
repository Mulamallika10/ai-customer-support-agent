"use client";

import ConversationMessages from "./ConversationMessages";
import AgentLogs from "../AgentLogs";

interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface AgentLog {
  id: string;
  conversation_id: string;
  step: string;
  tool_name: string | null;
  input: any;
  output: any;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface ConversationDetailsProps {
  conversationId: string;
  messages: Message[];
  logs: AgentLog[];
}

export default function ConversationDetails({
  conversationId,
  messages,
  logs,
}: ConversationDetailsProps) {
  return (
    <div className="space-y-6">

      {/* Conversation ID */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          Conversation ID
        </p>

        <p className="mt-1 break-all font-mono text-sm font-medium text-gray-800">
          {conversationId}
        </p>
      </div>

      {/* Messages */}
      <ConversationMessages
        messages={messages}
      />

      {/* Agent Logs */}
      <AgentLogs
        logs={logs}
      />

    </div>
  );
}