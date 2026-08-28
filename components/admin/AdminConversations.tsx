"use client";

import {
  useEffect,
  useState,
} from "react";

import ConversationDetails from "./ConversationDetails";

interface Conversation {
  id: string;
  customer_id: string | null;
  title: string;
  status: string;
  created_at: string;
}

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

export default function AdminConversations() {
  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<string | null>(null);

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([]);

  const [
    logs,
    setLogs,
  ] = useState<AgentLog[]>([]);

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // LOAD CONVERSATIONS
  // ==========================================

  async function loadConversations() {
    try {
      const response =
        await fetch(
          "/api/admin/conversations",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (data.success) {
        setConversations(
          data.conversations
        );
      }

    } catch (error) {
      console.error(
        "Failed to load conversations:",
        error
      );
    }
  }

  // ==========================================
  // LOAD SELECTED CONVERSATION
  // ==========================================

  async function loadConversation(
    conversationId: string
  ) {
    try {
      setLoading(true);

      // ----------------------------------------
      // Load messages
      // ----------------------------------------

      const conversationResponse =
        await fetch(
          `/api/conversations?id=${conversationId}`,
          {
            cache: "no-store",
          }
        );

      const conversationData =
        await conversationResponse.json();

      if (
        conversationData.success
      ) {
        setMessages(
          conversationData.messages ?? []
        );
      }

      // ----------------------------------------
      // Load logs using SAME conversation_id
      // ----------------------------------------

      const logsResponse =
        await fetch(
          `/api/logs?conversationId=${conversationId}`,
          {
            cache: "no-store",
          }
        );

      const logsData =
        await logsResponse.json();

      if (logsData.success) {
        setLogs(
          logsData.logs ?? []
        );
      }

    } catch (error) {
      console.error(
        "Failed to load conversation:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadConversations();
  }, []);

  // ==========================================
  // SELECT CONVERSATION
  // ==========================================

  function handleSelectConversation(
    id: string
  ) {
    setSelectedConversationId(id);

    loadConversation(id);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

      {/* ======================================
          LEFT: CONVERSATIONS
      ====================================== */}

      <div className="rounded-xl border bg-white shadow-sm">

        <div className="border-b p-5">

          <h2 className="font-semibold">
            Conversations
          </h2>

          <p className="text-sm text-gray-500">
            Select a conversation
          </p>

        </div>

        <div className="divide-y">

          {conversations.map(
            (conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() =>
                  handleSelectConversation(
                    conversation.id
                  )
                }
                className={`w-full p-4 text-left transition ${
                  selectedConversationId ===
                  conversation.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >

                <p className="font-medium">
                  {conversation.title}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {conversation.id}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {new Date(
                    conversation.created_at
                  ).toLocaleString()}
                </p>

              </button>
            )
          )}

        </div>

      </div>

      {/* ======================================
          RIGHT: DETAILS
      ====================================== */}

      <div>

        {!selectedConversationId && (
          <div className="rounded-xl border bg-white p-10 text-center shadow-sm">

            <p className="text-gray-500">
              Select a conversation to view
              messages and agent logs.
            </p>

          </div>
        )}

        {loading && (
          <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
            Loading conversation...
          </div>
        )}

        {selectedConversationId &&
          !loading && (
            <ConversationDetails
              conversationId={
                selectedConversationId
              }
              messages={messages}
              logs={logs}
            />
          )}

      </div>

    </div>
  );
}