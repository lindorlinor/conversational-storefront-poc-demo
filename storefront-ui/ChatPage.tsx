import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";
import { getCartId as defaultGetCartId, setCartId as defaultSetCartId } from "./utils/storefront";
import { DefaultChatTransport } from "ai";
import { ChatInput } from "./components/chat-input/ChatInput";
import Title from "./components/title";
import Section from "./components/Section";


// todo gestire l'intercettazione del cartId tramite eventi custom invece di ispezionare i messaggi: non è flessibile a cambiamenti futuri. (issue #)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function syncNewCartId(messages: any[], processedToolCalls: Set<string>, setCartId: (id: string) => void) {
  for (const message of messages) {
    if (message.role !== 'assistant') continue
    for (const part of message.parts ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = part as any
      if (
        p.type === 'tool-addToCartTool' &&
        p.state === 'output-available' &&
        p.output?.newCartId &&
        !processedToolCalls.has(p.toolCallId)
      ) {
        processedToolCalls.add(p.toolCallId)
        setCartId(p.output.newCartId)
      }
    }
  }
}

export function ChatPage({ apiUrl, getCartId = defaultGetCartId, setCartId = defaultSetCartId }: { apiUrl: string; getCartId?: () => string | null; setCartId?: (cartId: string) => void; }) {
  const parsed = new URL(apiUrl, window.location.href);
  const apiBase = parsed.pathname; // e.g. '/apps/chatbot'
  const shop = parsed.searchParams.get("shop") ?? "";

  const cartId = getCartId()
  const setCartIdRef = useRef(setCartId)
  setCartIdRef.current = setCartId

  const processedToolCalls = useRef(new Set<string>())

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: apiUrl, body: { cartId } }),
  });

  useEffect(() => {
    syncNewCartId(messages, processedToolCalls.current, setCartIdRef.current)
  }, [messages])

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

      <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3 flex-1 items-center">
        <div className="w-[95%] flex flex-col gap-3">
        {messages
          .filter((message) => message.role === "assistant")
          .slice(-1)
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

    </div>
  );
}
