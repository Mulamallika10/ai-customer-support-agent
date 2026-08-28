"use client";

import {
  FormEvent,
  useState,
} from "react";

import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
}

export default function ChatInput({
  onSend,
  loading = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    onSend(message);
    setInput("");
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3"
    >
      {/* Input */}
      <div
        className="
          flex-1
          rounded-2xl
          bg-gray-50
          px-4
          py-2
          transition
          focus-within:bg-white
          focus-within:ring-2
          focus-within:ring-cyan-100
        "
      >
        <textarea
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
          placeholder="Ask about your order or refund..."
          className="
            max-h-32
            min-h-[40px]
            w-full
            resize-none
            bg-transparent
            py-2
            text-sm
            text-gray-900
            outline-none
            placeholder:text-gray-400
          "
        />
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={
          loading ||
          !input.trim()
        }
        aria-label="Send message"
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-cyan-500
          text-white
          shadow-sm
          transition
          hover:bg-cyan-600
          hover:shadow-md
          disabled:cursor-not-allowed
          disabled:bg-gray-200
          disabled:text-gray-400
        "
      >
        <Send
          size={18}
          strokeWidth={2}
        />
      </button>
    </form>
  );
}