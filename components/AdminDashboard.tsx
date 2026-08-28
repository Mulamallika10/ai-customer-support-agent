"use client";

import { useEffect, useState } from "react";
import ConversationMessages from "./admin/ConversationMessages";
import AgentLogs from "./AgentLogs";

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
  conversation_id: string | null;
  step: string;
  tool_name: string | null;
  input: any;
  output: any;
  status: string;
  error_message: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [logs, setLogs] =
    useState<AgentLog[]>([]);

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // LOAD CONVERSATIONS
  // ==========================================

  async function loadConversations() {
    try {
      const response = await fetch(
        "/api/conversations/list",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
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

      const response = await fetch(
        `/api/conversations/logs?conversationId=${conversationId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setMessages(data.messages ?? []);
      setLogs(data.logs ?? []);
    } catch (error) {
      console.error(
        "Failed to load conversation:",
        error
      );

      setMessages([]);
      setLogs([]);
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
    conversationId: string
  ) {
    setSelectedConversationId(
      conversationId
    );

    loadConversation(
      conversationId
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-7xl">

        <h1 className="text-3xl font-bold">
          AI Customer Support
        </h1>

        <p className="mt-1 text-gray-500">
          Agent Monitoring Dashboard
        </p>

        <div className="mt-6 grid grid-cols-12 gap-6">

          {/* ================================= */}
          {/* CONVERSATIONS */}
          {/* ================================= */}

          <div className="col-span-4 overflow-hidden rounded-2xl bg-white shadow-sm">

            {/* Header */}
            <div className="px-5 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Conversations
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select a conversation
              </p>
            </div>

            {/* Conversation List */}
            <div className="px-3 pb-3">

              {conversations.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-gray-500">
                    No conversations found
                  </p>
                </div>
              ) : (
                <div className="space-y-1">

                  {conversations.map((conversation) => {

                    const selected =
                      selectedConversationId ===
                      conversation.id;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() =>
                          handleSelectConversation(
                            conversation.id
                          )
                        }
                        className={`w-full rounded-xl px-4 py-4 text-left transition-all duration-150 ${selected
                            ? "bg-gray-100"
                            : "bg-transparent hover:bg-gray-50"
                          }`}
                      >

                        {/* Title + Date */}
                        <div className="flex items-center justify-between gap-3">

                          <span
                            className={`truncate text-sm font-semibold ${selected
                                ? "text-gray-900"
                                : "text-gray-800"
                              }`}
                          >
                            {conversation.title}
                          </span>

                          <span className="shrink-0 text-xs text-gray-400">
                            {new Date(
                              conversation.created_at
                            ).toLocaleDateString()}
                          </span>

                        </div>

                        {/* Conversation ID */}
                        <p
                          className={`mt-1 truncate text-xs ${selected
                              ? "text-gray-500"
                              : "text-gray-400"
                            }`}
                        >
                          {conversation.id}
                        </p>

                      </button>
                    );
                  })}

                </div>
              )}

            </div>

          </div>

          {/* ================================= */}
          {/* DETAILS */}
          {/* ================================= */}

          <div className="col-span-8 space-y-6">

            {!selectedConversationId ? (
              <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
                Select a conversation to view
                messages and agent logs.
              </div>
            ) : loading ? (
              <div className="rounded-xl border bg-white p-10 text-center">
                Loading conversation...
              </div>
            ) : (
              <>
                <ConversationMessages
                  messages={messages}
                />

                <AgentLogs
                  logs={logs}
                />
              </>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}