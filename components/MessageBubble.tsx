"use client";

import { Bot } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  refund?: any;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isUser =
    message.role === "user";

  return (
    <div
      className={`flex w-full ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[85%] items-end gap-2 ${
          isUser
            ? "flex-row-reverse"
            : "flex-row"
        }`}
      >

        {/* AI Avatar */}

        {!isUser && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm">
            <Bot size={14} />
          </div>
        )}

        {/* Message */}

        <div
          className={`
            rounded-2xl
            px-4
            py-2.5
            text-sm
            leading-6
            ${
              isUser
                ? "rounded-br-md bg-cyan-500 text-white"
                : "rounded-bl-md bg-white text-gray-700 shadow-sm"
            }
          `}
        >
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>
        </div>

      </div>
    </div>
  );
}