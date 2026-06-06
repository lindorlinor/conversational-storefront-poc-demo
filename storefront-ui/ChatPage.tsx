import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";
import {
  getCartId as defaultGetCartId,
  setCartId as defaultSetCartId,
} from "./utils/storefront";
import { DefaultChatTransport } from "ai";
import { ChatInput } from "./components/chat-input/ChatInput";
import Title from "./components/title";
import Section from "./components/Section";
import PreviewSection from "./preview/PreviewSection"; // DEBUG — rimuovi per produzione

// todo gestire l'intercettazione del cartId tramite eventi custom invece di ispezionare i messaggi: non è flessibile a cambiamenti futuri. (issue #)
function syncNewCartId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[],
  processedToolCalls: Set<string>,
  setCartId: (id: string) => void,
) {
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    for (const part of message.parts ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = part as any;
      if (
        p.type === "tool-addToCartTool" &&
        p.state === "output-available" &&
        p.output?.newCartId &&
        !processedToolCalls.has(p.toolCallId)
      ) {
        processedToolCalls.add(p.toolCallId);
        setCartId(p.output.newCartId);
      }
    }
  }
}

export function ChatPage({
  apiUrl,
  getCartId = defaultGetCartId,
  setCartId = defaultSetCartId,
}: {
  apiUrl: string;
  getCartId?: () => string | null;
  setCartId?: (cartId: string) => void;
}) {
  const parsed = new URL(apiUrl, window.location.href);
  const apiBase = parsed.pathname;
  const shop = parsed.searchParams.get("shop") ?? "";

  const cartId = getCartId();
  const setCartIdRef = useRef(setCartId);
  setCartIdRef.current = setCartId;

  const processedToolCalls = useRef(new Set<string>());

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: apiUrl, body: { cartId } }),
  });

  useEffect(() => {
    syncNewCartId(messages, processedToolCalls.current, setCartIdRef.current);
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-widget-page-from to-widget-page-to">
      <div className="flex justify-center items-center px-5 py-6 text-center">
        <Title apiBase={apiBase} shop={shop} />
      </div>

      <div className="flex justify-center px-5 py-4">
        <div className="w-1/2">
          <ChatInput
            onSend={(text) => sendMessage({ text })}
            disabled={status === "streaming" || status === "submitted"}
          />
        </div>
      </div>

      <div className="overflow-y-auto flex flex-col flex-1">

        <div className="flex flex-col">
          {messages
            .filter((message) => message.role === "assistant")
            .slice(-1)
            .map(
              (message) => (
                console.log("Rendering message:", message),
                (<Section key={message.id} message={message} />)
              ),
            )}
          {(status === "streaming" || status === "submitted") && (
            <div className="w-[80%] mx-auto py-3">
              <div className="self-start bg-widget-surface px-4 py-2.5 rounded-lg text-base text-widget-text-muted">
                ...
              </div>
            </div>
          )}
        </div>

        <PreviewSection /> {/* DEBUG — rimuovi per produzione */}

      </div>
    </div>
  );
}
