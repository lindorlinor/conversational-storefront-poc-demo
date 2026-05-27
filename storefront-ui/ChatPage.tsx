import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatInput } from "./components/chat-input/ChatInput";
import Title from "./components/title";
import Section from "./components/Section";

export function ChatPage({ apiUrl }: { apiUrl: string }) {
  const parsed = new URL(apiUrl, window.location.href);
  const apiBase = parsed.pathname; // e.g. '/apps/chatbot'
  const shop = parsed.searchParams.get("shop") ?? "";

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: apiUrl }),
  });

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex justify-center items-center px-5 py-6 border-b border-gray-200 text-center">
        <Title apiBase={apiBase} shop={shop} />
      </div>

      <div className="flex justify-center px-5 py-4 border-b border-gray-200">
        <div className="w-1/2">
          <ChatInput
            onSend={(text) => sendMessage({ text })}
            disabled={status === "streaming" || status === "submitted"}
          />
        </div>
      </div>

      <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3 flex-1">
        {messages
          .filter((message) => message.role === "assistant")
          .map((message) => (
            console.log("Rendering message:", message),
            <Section key={message.id} message={message} />
          ))}
        {(status === "streaming" || status === "submitted") && (
          <div className="self-start bg-gray-100 px-4 py-2.5 rounded-lg text-base text-gray-400">
            ...
          </div>
        )}
      </div>

    </div>
  );
}
