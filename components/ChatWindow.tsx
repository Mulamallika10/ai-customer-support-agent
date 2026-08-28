"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Phone,
  X,
  MoreHorizontal,
  ShieldCheck,
  Headphones,
} from "lucide-react";

import MessageBubble, {
  ChatMessage,
} from "./MessageBubble";

import ChatInput from "./ChatINput";

type ConversationMessage = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  customer_id: string | null;
  title: string;
  created_at: string;
};

type ChatWindowProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChatWindow({
  isOpen,
  onClose,
}: ChatWindowProps) {
  // =====================================================
  // STATE
  // =====================================================

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // INITIALIZE CHAT
  // =====================================================

  useEffect(() => {
    initializeChat();
  }, []);

  // =====================================================
  // CREATE / LOAD CONVERSATION
  // =====================================================

  async function initializeChat() {
    try {
      setInitializing(true);
      setError(null);

      const storedConversationId =
        localStorage.getItem("customer-conversation-id");

      // -------------------------------------------------
      // LOAD EXISTING CONVERSATION
      // -------------------------------------------------

      if (storedConversationId) {
        console.log(
          "Loading existing conversation:",
          storedConversationId
        );

        const response = await fetch(
          `/api/conversations?id=${encodeURIComponent(
            storedConversationId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setConversationId(data.conversation.id);

          loadMessages(data.messages || []);

          return;
        }

        localStorage.removeItem(
          "customer-conversation-id"
        );
      }

      // -------------------------------------------------
      // CREATE NEW CONVERSATION
      // -------------------------------------------------

      console.log("Creating new conversation...");

      const response = await fetch(
        "/api/conversations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Customer Support",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to create conversation"
        );
      }

      const newConversation: Conversation =
        data.conversation;

      setConversationId(newConversation.id);

      localStorage.setItem(
        "customer-conversation-id",
        newConversation.id
      );

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! 👋 How can I help you today?",
        },
      ]);
    } catch (error) {
      console.error(
        "Initialize chat error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to initialize chat"
      );
    } finally {
      setInitializing(false);
    }
  }

  // =====================================================
  // LOAD EXISTING MESSAGES
  // =====================================================

  function loadMessages(
    conversationMessages: ConversationMessage[]
  ) {
    const formattedMessages: ChatMessage[] =
      conversationMessages
        .filter(
          (message) =>
            message.role === "user" ||
            message.role === "assistant"
        )
        .map((message) => ({
          id: message.id,
          role: message.role as
            | "user"
            | "assistant",
          content: message.content,
        }));

    if (formattedMessages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! 👋 How can I help you with Ai customer support today?",
        },
      ]);

      return;
    }

    setMessages(formattedMessages);
  }

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  async function sendMessage(message: string) {
    if (!message.trim()) {
      return;
    }

    if (!conversationId) {
      console.error(
        "Conversation ID is missing"
      );

      setError(
        "Conversation is not initialized yet."
      );

      return;
    }

    const trimmedMessage = message.trim();

    // -------------------------------------------------
    // ADD USER MESSAGE
    // -------------------------------------------------

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setLoading(true);
    setError(null);

    try {
      console.log("SENDING CHAT:", {
        message: trimmedMessage,
        conversationId,
      });

      // -------------------------------------------------
      // CALL CHAT API
      // -------------------------------------------------

      const response = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
            conversationId,
          }),
        }
      );

      const data = await response.json();

      console.log("CHAT RESPONSE:", data);

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to process request"
        );
      }

      // -------------------------------------------------
      // ASSISTANT RESPONSE
      // -------------------------------------------------

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          data.response ||
          "I couldn't generate a response.",
        refund:
          data.refund ||
          undefined,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      // -------------------------------------------------
      // UPDATE CONVERSATION ID
      // -------------------------------------------------

      if (data.conversationId) {
        setConversationId(
          data.conversationId
        );

        localStorage.setItem(
          "customer-conversation-id",
          data.conversationId
        );
      }
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // NEW CHAT
  // =====================================================

  async function startNewChat() {
    try {
      setLoading(false);
      setError(null);

      const response = await fetch(
        "/api/conversations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Customer Support",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to create new chat"
        );
      }

      const newConversation =
        data.conversation;

      setConversationId(
        newConversation.id
      );

      localStorage.setItem(
        "customer-conversation-id",
        newConversation.id
      );

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! 👋 How can I help you today?",
        },
      ]);
    } catch (error) {
      console.error(
        "New chat error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create new chat"
      );
    }
  }

  // =====================================================
  // CLOSED
  // =====================================================

  if (!isOpen) {
    return null;
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (initializing) {
    return (
      <div className="fixed bottom-5 right-5 z-[9999] flex h-[620px] w-[490px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <ChatHeader onClose={onClose} />

        <div className="flex flex-1 items-center justify-center bg-[#f7f8fa]">
          <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-cyan-500" />

            <span>
              Starting secure support chat...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex h-[620px] w-[490px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_45px_rgba(0,0,0,0.20)]">

      {/* =================================================
          HEADER
      ================================================= */}

      <ChatHeader onClose={onClose} />

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          MESSAGES
      ================================================= */}

      <div className="flex-1 overflow-y-auto bg-[#f7f8fa] px-3 py-4">

        <div className="space-y-4">

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))}

          {/* =============================================
              LOADING
          ============================================= */}

          {loading && (
            <div className="flex items-end gap-2">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Bot
                  size={15}
                  className="text-cyan-600"
                />
              </div>

              <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <div className="flex gap-1">

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />

                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* =================================================
          INPUT
      ================================================= */}

      <div className="border-t border-gray-200 bg-white px-3 py-3">

        <ChatInput
          onSend={sendMessage}
          loading={
            loading ||
            initializing
          }
        />

        {/* <div className="mt-2 flex items-center justify-center gap-1 text-[9px] text-gray-400">
          <ShieldCheck size={10} />
          <span>
            Customer AI can make mistakes. Verify important info.
          </span>
        </div> */}

      </div>
    </div>
  );
}

// =======================================================
// CHAT HEADER
// =======================================================

function ChatHeader({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
          <Bot
            size={19}
            className="text-cyan-600"
          />

          <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-800">
             Customer AI Support
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-green-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            ONLINE
          </div>
        </div>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1">

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          title="Call support"
        >
          <Phone size={16} />
        </button>

        <button
          type="button"
          className="px-2 text-[11px] font-medium text-gray-600 hover:text-gray-900"
        >
          End Chat
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          title="Close chat"
        >
          <X size={18} />
        </button>

      </div>

    </div>
  );
}