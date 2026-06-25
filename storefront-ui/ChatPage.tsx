import { useChat, type UIMessage } from "@ai-sdk/react";
import WidgetRenderer from "./components/WidgetRenderer";
import { useRef, useEffect, useState } from "react";
import { cart } from "./cart";
import { DefaultChatTransport } from "ai";
import { ChatInput } from "./components/ChatInput";
import Title from "./components/title";
import Section from "./components/Section";
import type { SerializedComponentSchema } from "./component-registry";
import { loadMessages, saveMessages, clearMessages, loadDismissed, dismissToolCall } from "./chat-session";
import { AddToCartProvider, type AddToCartRequest } from "./add-to-cart-context";
/* import PreviewSection from "./preview/PreviewSection"; */
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
        p.type === "tool-requestChangeMarketTool" &&
        p.state === "output-available" &&
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

function notifyViewCart(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[],
  processedToolCalls: Set<string>,
  shop: string,
  onViewCart?: (dismiss: () => void) => void,
) {
  const dismissed = loadDismissed(shop);
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    for (const part of message.parts ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = part as any;
      if (
        p.type === "tool-viewCartTool" &&
        p.state === "output-available" &&
        !processedToolCalls.has(p.toolCallId) &&
        !dismissed.has(p.toolCallId)
      ) {
        processedToolCalls.add(p.toolCallId);
        const dismiss = () => dismissToolCall(shop, p.toolCallId);
        onViewCart?.(dismiss);
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


export function ChatPage({ apiUrl, componentSchemas, country, language, onChangeMarket, onClose, onViewCart, onAddToCart
 }: {
  apiUrl: string;
  country?: string;
  language?: string;
  componentSchemas?: Record<string, SerializedComponentSchema>;
  onChangeMarket?: (isoCode: string, dismiss: () => void) => void;
  onClose?: () => void;
  onViewCart?: ( dismiss: () => void) => void;
  onAddToCart?: AddToCartRequest;
}) {
  const parsed = new URL(apiUrl, window.location.href);
  const apiBase = parsed.pathname;
  const shop = parsed.searchParams.get("shop") ?? "";

  const processedToolCalls = useRef(new Set<string>());
  const [isScrolled, setIsScrolled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const DEFAULT_PLACEHOLDER = "Scrivi un messaggio...";
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);

  const { messages, sendMessage, setMessages, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: apiUrl }),
    messages: loadMessages(shop),
  });

  /* cart id letto al momento dell'invio perchè può cambiare durante la sessione (prima null e poi modificato)*/
  /* componentSchemas: schemi (JSON Schema) dei componenti del merchant, inviati
     a ogni richiesta così il backend può generare i tool corrispondenti. per ora così, todo endpoint probabilmente */
  const send = (text: string) => {
    sendMessage({ text }, { body: { cartId: cart.getId(), componentSchemas, country, language } });
    setInputValue("");
    setPlaceholder(text);
  };

   const onAddToCartFromUI: AddToCartRequest = async (variantId, quantity) => {
    const res = onAddToCart
      ? await onAddToCart(variantId, quantity)
      : ({ success: false, reason: "add-to-cart non disponibile" } as const);
    setMessages((prev) => [
      ...prev,
      {
        id: `add-to-cart-${Date.now()}`,
        role: "user",
        parts: [{ type: "text", text: `[risultato aggiunta carrello: ${JSON.stringify(res)}]` }],
      },
    ]);
    return res;
  };

  useEffect(() => {
    if (messages.length > 0) saveMessages(shop, messages);
    syncNewCartId(messages, processedToolCalls.current);
    notifyViewCart(messages, processedToolCalls.current, shop ?? '', onViewCart);
    notifyMarketChanged(messages, processedToolCalls.current, shop ?? '', onChangeMarket);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const message of messages as any[]) {
      if (message.role !== "assistant") continue;
      for (const part of message.parts ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = part as any;
        if (
          p.type === "tool-requestAddToCartTool" &&
          p.state === "output-available" &&
          !processedToolCalls.current.has(p.toolCallId)
        ) {
          processedToolCalls.current.add(p.toolCallId);
          if (!onAddToCart) continue;
          setAddingToCart(true);
          void onAddToCart(p.output.variantId, p.output.quantity)
            .then((res) => {
              sendMessage(
                { text: `[risultato aggiunta carrello: ${JSON.stringify(res)}]` },
                { body: { cartId: cart.getId(), componentSchemas, country, language } },
              );
            })
            .finally(() => setAddingToCart(false));
        }
      }
    }
  }, [messages, onChangeMarket, onAddToCart, onViewCart, shop, sendMessage, componentSchemas, country, language]);

  const disabled = status === "streaming" || status === "submitted" || addingToCart;

  return (
    <AddToCartProvider value={onAddToCartFromUI}>
    <div className="tw:font-widget-primary tw:flex tw:flex-col tw:h-screen tw:bg-gradient-to-b tw:from-widget-page-from tw:to-widget-page-to">

      <button
        type="button"
        onClick={() => { stop(); clearMessages(shop); setInputValue(""); setPlaceholder(DEFAULT_PLACEHOLDER); setMessages([]); processedToolCalls.current.clear(); }}
        className="tw:font-widget-secondary tw:fixed tw:top-4 tw:left-4 tw:z-50 tw:flex tw:items-center tw:gap-1.5 tw:rounded-widget-base tw:border tw:border-widget-border tw:bg-widget-bg tw:px-3 tw:py-1.5 tw:text-sm tw:text-widget-text-secondary tw:shadow-sm tw:transition tw:hover:text-widget-text"
      >
        Reset
      </button>
      <button
      type="button"
      onClick={() => onClose?.()}
      className="tw:font-widget-secondary tw:fixed tw:top-4 tw:right-4 tw:z-50 tw:flex tw:items-center tw:gap-1.5 tw:rounded-widget-base tw:border tw:border-widget-border tw:bg-widget-bg tw:px-3 tw:py-1.5 tw:text-sm tw:text-widget-text-secondary tw:shadow-sm tw:transition tw:hover:text-widget-text"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tw:h-4 tw:w-4">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
      </button>

      <div className={`tw:flex tw:justify-center tw:items-center tw:px-5 tw:text-center tw:transition-all tw:duration-300 tw:overflow-hidden ${isScrolled ? "tw:max-h-0 tw:opacity-0 tw:py-0" : "tw:max-h-40 tw:opacity-100 tw:py-6"}`}>
        <Title apiBase={apiBase} shop={shop} />
      </div>

      <div className={`tw:flex tw:justify-center tw:px-5 tw:transition-all tw:duration-300 tw:overflow-hidden ${isScrolled ? "tw:max-h-0 tw:opacity-0 tw:py-0 tw:pointer-events-none" : "tw:max-h-40 tw:opacity-100 tw:py-4"}`}>
        <div className="tw:w-1/2">
          <ChatInput value={inputValue} onChange={setInputValue} onSend={send} disabled={disabled} placeholder={placeholder} />
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
            .flatMap((message) => (
              console.log("Rendering message:", message),
              message.parts.map((part: UIMessage["parts"][number], i: number) => {
                
                if (part.type === "text") {
                  return (
                    <Section key={`${message.id}-${i}`}>
                      <p className="tw:font-widget-secondary tw:text-sm tw:leading-relaxed tw:text-widget-text">{part.text}</p>
                    </Section>
                  );
                }

                if (part.type.startsWith("tool-")) {
                  const toolPart = part as {
                    type: string;
                    state: string;
                    input: Record<string, unknown>;
                  };
                  const toolName = toolPart.type.slice("tool-".length);
                  return (
                    <Section key={`${message.id}-${i}`}>
                      <WidgetRenderer
                        toolName={toolName}
                        input={toolPart.input}
                        state={toolPart.state}
                      />
                    </Section>
                  );
                }

                return null;
              })
            ))}
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
        <ChatInput value={inputValue} onChange={setInputValue} onSend={send} disabled={disabled} placeholder={placeholder} />
      </div>

    </div>
    </AddToCartProvider>
  );
}
