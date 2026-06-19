import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { cart } from "./cart";
import { DefaultChatTransport } from "ai";
import { ChatInput } from "./components/chat-input/ChatInput";
import Title from "./components/title";
import Section from "./components/Section";
import type { SerializedComponentSchema } from "./component-registry";
/* import PreviewSection from "./preview/PreviewSection";
 */
function notifyMarketChanged(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[],
  processedToolCalls: Set<string>,
  shop: string,
  onChangeMarket?: (isoCode: string, dismiss: () => void) => void,
) {
  const dismissed = loadDismissed(shop);
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    for (const part of message.parts ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = part as any;
      if (
        p.type === "tool-changeMarketTool" &&
        p.state === "output-available" &&
        p.output?.ok &&
        !processedToolCalls.has(p.toolCallId) &&
        !dismissed.has(p.toolCallId)
      ) {
        processedToolCalls.add(p.toolCallId);
        const dismiss = () => dismissToolCall(shop, p.toolCallId);
        onChangeMarket?.(p.output.isoCode, dismiss);
      }
    }
  }
}

// todo gestire l'intercettazione del cartId tramite eventi custom invece di ispezionare i messaggi: non è flessibile a cambiamenti futuri. (issue #)
function syncNewCartId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[],
  processedToolCalls: Set<string>,
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
        cart.applyId(p.output.newCartId);
      }
    }
  }
}

const SESSION_KEY = "conversational-storefront:messages";
const DISMISSED_KEY = "conversational-storefront:dismissed";

function loadMessages(shop: string) {
  try {
    const raw = sessionStorage.getItem(`${SESSION_KEY}:${shop}`);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function clearMessages(shop: string) {
  try {
    sessionStorage.removeItem(`${SESSION_KEY}:${shop}`);
    sessionStorage.removeItem(`${DISMISSED_KEY}:${shop}`);
  } catch {
    // ignore
  }
}

function loadDismissed(shop: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(`${DISMISSED_KEY}:${shop}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function dismissToolCall(shop: string, toolCallId: string) {
  try {
    const dismissed = loadDismissed(shop);
    dismissed.add(toolCallId);
    sessionStorage.setItem(`${DISMISSED_KEY}:${shop}`, JSON.stringify([...dismissed]));
  } catch {
    // ignore
  }
}

function saveMessages(shop: string, messages: unknown[]) {
  try {
    sessionStorage.setItem(`${SESSION_KEY}:${shop}`, JSON.stringify(messages));
  } catch {
    // sessionStorage non disponibile (es. iframe con cookie bloccati)
  }
}

export function ChatPage({ apiUrl, componentSchemas, country, language, onChangeMarket, onClose }: {
  apiUrl: string;
  country?: string;
  language?: string;
  componentSchemas?: Record<string, SerializedComponentSchema>;
  onChangeMarket?: (isoCode: string, dismiss: () => void) => void;
  onClose?: () => void;
}) {
  const parsed = new URL(apiUrl, window.location.href);
  const apiBase = parsed.pathname;
  const shop = parsed.searchParams.get("shop") ?? "";

  const processedToolCalls = useRef(new Set<string>());
  const [isScrolled, setIsScrolled] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: apiUrl }),
    messages: loadMessages(shop),
  });

  /* cart id letto al momento dell'invio perchè può cambiare durante la sessione (prima null e poi modificato)*/
  /* componentSchemas: schemi (JSON Schema) dei componenti del merchant, inviati
     a ogni richiesta così il backend può generare i tool corrispondenti. per ora così, todo endpoint probabilmente */
  const send = (text: string) => {
    sendMessage({ text }, { body: { cartId: cart.getId(), componentSchemas, country, language } });
    setInputValue("");
  };

  useEffect(() => {
    if (messages.length > 0) saveMessages(shop, messages);
    syncNewCartId(messages, processedToolCalls.current);
    notifyMarketChanged(messages, processedToolCalls.current, shop ?? '', onChangeMarket);
  }, [messages, onChangeMarket, shop]);

  const disabled = status === "streaming" || status === "submitted";

  return (
    <div className="tw:font-widget-primary tw:flex tw:flex-col tw:h-screen tw:bg-gradient-to-b tw:from-widget-page-from tw:to-widget-page-to">

      <button
        type="button"
        onClick={() => { clearMessages(shop); onClose?.(); }}
        className="tw:font-widget-secondary tw:fixed tw:top-4 tw:right-4 tw:z-50 tw:flex tw:items-center tw:gap-1.5 tw:rounded-widget-base tw:border tw:border-widget-border tw:bg-widget-bg tw:px-3 tw:py-1.5 tw:text-sm tw:text-widget-text-secondary tw:shadow-sm tw:transition tw:hover:text-widget-text"
      >
        Negozio
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tw:h-4 tw:w-4">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>

      <div className={`tw:flex tw:justify-center tw:items-center tw:px-5 tw:text-center tw:transition-all tw:duration-300 tw:overflow-hidden ${isScrolled ? "tw:max-h-0 tw:opacity-0 tw:py-0" : "tw:max-h-40 tw:opacity-100 tw:py-6"}`}>
        <Title apiBase={apiBase} shop={shop} />
      </div>

      <div className={`tw:flex tw:justify-center tw:px-5 tw:transition-all tw:duration-300 tw:overflow-hidden ${isScrolled ? "tw:max-h-0 tw:opacity-0 tw:py-0 tw:pointer-events-none" : "tw:max-h-40 tw:opacity-100 tw:py-4"}`}>
        <div className="tw:w-1/2">
          <ChatInput value={inputValue} onChange={setInputValue} onSend={send} disabled={disabled} />
        </div>
      </div>

      <div
        className="tw:overflow-y-auto tw:flex tw:flex-col tw:flex-1"
        onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 50)}
      >

        <div className="tw:flex tw:flex-col">
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
            <div className="tw:w-[80%] tw:mx-auto tw:py-3">
              <div className="tw:self-start tw:bg-widget-surface tw:px-4 tw:py-2.5 tw:rounded-lg tw:text-base tw:text-widget-text-muted">
                ...
              </div>
            </div>
          )}
        </div>

{/*         <PreviewSection />
 */}
      </div>

      <div className={`tw:fixed tw:bottom-6 tw:left-1/2 tw:-translate-x-1/2 tw:w-1/2 tw:z-50 tw:transition-all tw:duration-300 ${isScrolled ? "tw:opacity-100 tw:translate-y-0" : "tw:opacity-0 tw:translate-y-4 tw:pointer-events-none"}`}>
        <ChatInput value={inputValue} onChange={setInputValue} onSend={send} disabled={disabled} />
      </div>

    </div>
  );
}
