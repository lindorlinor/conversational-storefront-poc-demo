import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: apiUrl, body: { cartId } }),
  });

  useEffect(() => {
    syncNewCartId(messages, processedToolCalls.current, setCartIdRef.current);
  }, [messages]);

  const disabled = status === "streaming" || status === "submitted";

  return (
    <div className="font-widget-primary flex flex-col h-screen bg-gradient-to-b from-widget-page-from to-widget-page-to">

      <div className={`flex justify-center items-center px-5 text-center transition-all duration-300 overflow-hidden ${isScrolled ? "max-h-0 opacity-0 py-0" : "max-h-40 opacity-100 py-6"}`}>
        <Title apiBase={apiBase} shop={shop} />
      </div>

      <div className={`flex justify-center px-5 transition-all duration-300 overflow-hidden ${isScrolled ? "max-h-0 opacity-0 py-0 pointer-events-none" : "max-h-40 opacity-100 py-4"}`}>
        <div className="w-1/2">
          <ChatInput value={inputValue} onChange={setInputValue} onSend={(text) => { sendMessage({ text }); setInputValue(""); }} disabled={disabled} />
        </div>
      </div>

      <div
        className="overflow-y-auto flex flex-col flex-1"
        onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 50)}
      >

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

        <PreviewSection />

      </div>

      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-1/2 z-50 transition-all duration-300 ${isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <ChatInput value={inputValue} onChange={setInputValue} onSend={(text) => { sendMessage({ text }); setInputValue(""); }} disabled={disabled} />
      </div>

    </div>
  );
}
