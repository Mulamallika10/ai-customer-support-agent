interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function ConversationMessages({
  messages,
}: {
  messages: Message[];
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm">

      <div className="border-b p-5">

        <h2 className="font-semibold">
          Conversation
        </h2>

        <p className="text-sm text-gray-500">
          Customer and assistant messages
        </p>

      </div>

      <div className="space-y-4 p-5">

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`max-w-[75%] rounded-xl p-4 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >

              <p className="mb-1 text-xs font-semibold opacity-70">
                {message.role === "user"
                  ? "Customer"
                  : "AI Agent"}
              </p>

              <p className="text-sm">
                {message.content}
              </p>

              <p className="mt-2 text-xs opacity-50">
                {new Date(
                  message.created_at
                ).toLocaleTimeString()}
              </p>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}