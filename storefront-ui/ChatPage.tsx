import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
// import { ProductCard } from "./components";
import { ComponentMap } from "./registry-mapper";
import { ComponentName} from "../app/components-schema/registry";
import { ChatInput } from "./components/chat-input/ChatInput";

export function ChatPage({ apiUrl }: { apiUrl: string }) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: apiUrl }),
  });

  return (
    <div className="flex flex-col h-screen bg-white">
      <h1 className="px-5 py-3 border-b border-gray-200 font-semibold text-3xl">
        Chat
      </h1>

      <div className="flex justify-center px-5 py-4 border-b border-gray-200">
        <div className="w-1/2">
          <ChatInput
            onSend={(text) => sendMessage({ text })}
            disabled={status === "streaming" || status === "submitted"}
          />
        </div>
      </div>

      <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3 flex-1">
        {messages.map((message) => (
          <div
          key={message.id}
          className={`max-w-[80%] px-4 py-2.5 rounded-lg text-base ${
            message.role === "user"
            ? "self-end bg-black text-white"
            : "self-start bg-gray-100 text-black"
          }`}
          >
            {message.parts.map((part, i) => {
            console.log('message part:', part)
              if (part.type === "text") return <span key={i}>{part.text}</span>;
              /* if (
                part.type === "tool-searchProductTool" &&
                part.state === "output-available"
              ) {
                const output = part.output as {
                  products: Array<{
                    id: string;
                    handle: string;
                    title: string;
                    url: string | null;
                    featuredImage?: { url: string };
                    priceRange: {
                      minVariantPrice: { amount: string; currencyCode: string };
                    };
                    variants?: {
                      nodes: Array<{
                        id: string;
                        title: string;
                        price: { amount: string };
                        image?: { url: string };
                      }>;
                    };
                  }>;
                };
                return output.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    handle={p.handle}
                    title={p.title}
                    url={p.url ?? `/products/${p.handle}`}
                    imgUrl={p.featuredImage?.url ?? ""}
                    priceRange={p.priceRange}
                    variants={p.variants?.nodes}
                  />
                ));
              }
              return null; */
              if (!part.type.startsWith('tool-')) return null;
              const toolPart = part as { type: string; state: string; input: Record<string, unknown> };
              if (!toolPart.input) return null;
              const toolName = toolPart.type.slice('tool-'.length) as ComponentName;
              const Component = ComponentMap[toolName];
              if (!Component) return null;
              return <Component key={i} {...toolPart.input} />;
            })}
          </div>
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
