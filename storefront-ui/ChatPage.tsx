import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "@ai-sdk/react";
import { useRef, useEffect } from "react";
import { getCartId as defaultGetCartId, setCartId as defaultSetCartId } from "./utils/storefront";
import { DefaultChatTransport } from "ai";
import { ChatInput } from "./components/chat-input/ChatInput";
import Title from "./components/title";
import Section from "./components/Section";
import { ProductList } from "./components/ProductList";
import { ProductHero } from "./components/ProductHero";
import { CollectionWidget } from "./components/CollectionWidget";
import { VariantSelector } from "./components/VariantSelector";

const _IMG_TEE    = "https://placehold.co/400x400/e2e8f0/64748b?text=Pupu";
const _IMG_HOODIE = "https://placehold.co/400x400/fef3c7/92400e?text=Caca";
const _IMG_JACKET = "https://placehold.co/400x400/dbeafe/1e40af?text=Gugu";
const _IMG_CAP    = "https://placehold.co/400x400/f0fdf4/166534?text=Gaga";
const _IMG_COLL   = "https://placehold.co/400x400/fdf4ff/7e22ce?text=PupuCaca";

const PREVIEW_PRODUCT_1 = {
  id: "gid://shopify/Product/1",
  title: "Classic White Tee",
  description: "A timeless essential made from 100% organic cotton. Comfortable fit for everyday wear.",
  imgUrl: _IMG_TEE,
  images: [
    { url: _IMG_TEE,    altText: "Classic White Tee" },
    { url: _IMG_HOODIE, altText: "Classic White Tee — detail" },
  ],
  url: "https://example.myshopify.com/products/classic-white-tee",
  price: { amount: "29.99", currencyCode: "EUR" },
};

const PREVIEW_PRODUCT_2 = {
  id: "gid://shopify/Product/2",
  title: "Urban Hoodie",
  description: "Premium heavyweight hoodie in a relaxed fit.",
  imgUrl: _IMG_HOODIE,
  images: [{ url: _IMG_HOODIE, altText: "Urban Hoodie" }],
  url: "https://example.myshopify.com/products/urban-hoodie",
  price: { amount: "79.00", currencyCode: "EUR" },
};

const PREVIEW_PRODUCT_3 = {
  id: "gid://shopify/Product/3",
  title: "Denim Jacket",
  description: "Classic denim jacket with modern slim cut.",
  imgUrl: _IMG_JACKET,
  images: [{ url: _IMG_JACKET, altText: "Denim Jacket" }],
  url: "https://example.myshopify.com/products/denim-jacket",
  price: { amount: "129.00", currencyCode: "EUR" },
};

const PREVIEW_PRODUCT_HERO = {
  id: "gid://shopify/Product/4",
  title: "Premium Wool Cap",
  description: "Handcrafted merino wool cap, perfect for the colder months. One size fits all. Made in Italy.",
  imgUrl: _IMG_CAP,
  images: [
    { url: _IMG_CAP,    altText: "Premium Wool Cap" },
    { url: _IMG_JACKET, altText: "Premium Wool Cap — worn" },
  ],
  url: "https://example.myshopify.com/products/premium-wool-cap",
  price: { amount: "49.00", currencyCode: "EUR" },
  variants: [
    { id: "gid://shopify/ProductVariant/10", title: "Natural",  price: { amount: "49.00" } },
    { id: "gid://shopify/ProductVariant/11", title: "Charcoal", price: { amount: "49.00" } },
    { id: "gid://shopify/ProductVariant/12", title: "Navy",     price: { amount: "49.00" } },
  ],
};

const PREVIEW_COLLECTION = {
  title: "Summer Essentials",
  description: "A curated selection of lightweight pieces perfect for the warm season.",
  coverImageUrl: _IMG_COLL,
  products: [
    PREVIEW_PRODUCT_1,
    PREVIEW_PRODUCT_2,
    PREVIEW_PRODUCT_3,
    { id: "gid://shopify/Product/5", title: "Linen Shorts", imgUrl: _IMG_CAP, url: "https://example.myshopify.com/products/linen-shorts", price: { amount: "55.00", currencyCode: "EUR" } },
  ],
};

const PREVIEW_VARIANT_PRODUCT = {
  id: "gid://shopify/Product/6",
  title: "Runner Sneaker",
  description: "Lightweight performance running shoe with breathable mesh upper and responsive foam sole.",
  images: [
    { url: _IMG_TEE,    altText: "Runner Sneaker" },
    { url: _IMG_JACKET, altText: "Runner Sneaker — side" },
  ],
  url: "https://example.myshopify.com/products/runner-sneaker",
  price: { amount: "149.00", currencyCode: "EUR" },
  variants: [
    { id: "gid://shopify/ProductVariant/20", title: "38", price: { amount: "149.00" }, available: true  },
    { id: "gid://shopify/ProductVariant/21", title: "39", price: { amount: "149.00" }, available: true  },
    { id: "gid://shopify/ProductVariant/22", title: "40", price: { amount: "149.00" }, available: false },
    { id: "gid://shopify/ProductVariant/23", title: "41", price: { amount: "149.00" }, available: true  },
    { id: "gid://shopify/ProductVariant/24", title: "42", price: { amount: "149.00" }, available: true  },
    { id: "gid://shopify/ProductVariant/25", title: "43", price: { amount: "149.00" }, available: false },
  ],
  variantLabel: "Taglia",
};

const PREVIEW_SECTION_MESSAGE = {
  id: "preview-section-1",
  role: "assistant",
  content: "Ecco alcune opzioni selezionate per te.",
  parts: [
    { type: "text", text: "Ciao! Ho selezionato alcune opzioni in linea con il tuo stile. Dai un'occhiata ai prodotti qui sotto — fammi sapere se vuoi approfondire qualcosa." },
  ],
  createdAt: new Date(),
} as unknown as UIMessage;


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

        {/* messaggi — area centrata */}
        <div className="px-5 py-4 flex flex-col gap-3 items-center">
          <div className="w-[80%] flex flex-col gap-3">
            {messages
              .filter((message) => message.role === "assistant")
              .slice(-1)
              .map((message) => (
                console.log("Rendering message:", message),
                <Section key={message.id} message={message} />
              ))}
            {(status === "streaming" || status === "submitted") && (
              <div className="self-start bg-widget-surface px-4 py-2.5 rounded-lg text-base text-widget-text-muted">
                ...
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">

          <Section message={PREVIEW_SECTION_MESSAGE} />

          <Section>
            <div className="w-[80%] mx-auto">
              <ProductList products={[PREVIEW_PRODUCT_1, PREVIEW_PRODUCT_2, PREVIEW_PRODUCT_3]} />
            </div>
          </Section>

          <Section>
            <div className="w-[80%] mx-auto">
              <ProductHero {...PREVIEW_PRODUCT_HERO} />
            </div>
          </Section>

          <Section>
            <div className="w-[80%] mx-auto">
              <CollectionWidget {...PREVIEW_COLLECTION} />
            </div>
          </Section>

          <Section>
            <div className="w-[80%] mx-auto">
              <VariantSelector {...PREVIEW_VARIANT_PRODUCT} />
            </div>
          </Section>
        </div>

      </div>

    </div>
  );
}
