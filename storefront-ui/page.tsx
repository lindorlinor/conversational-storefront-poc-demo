import { createRoot, Root } from "react-dom/client";
import { ChatPage } from "./ChatPage";
import { getCartId as defaultGetCartId, setCartId as defaultSetCartId } from "./utils/storefront";
import rawStyles from "./page.css?inline";

const styleEl = document.createElement("style");
styleEl.textContent = rawStyles.replace(
  /@layer\s+utilities\s*\{([\s\S]*?)\}(?=\s*(?:@layer|$))/g,
  "$1"
);
document.head.appendChild(styleEl);

interface InitOptions {
  apiUrl?: string;
  getCartId?: () => string | null;
  setCartId?: (cartId: string) => void;
}

declare global {
  interface Window {
    ConversationalStorefront: { init: (options?: InitOptions) => void };
  }
}

let root: Root | null = null;

window.ConversationalStorefront = {
  init({ apiUrl, getCartId, setCartId }: InitOptions = {}) {
    const container = document.getElementById("chat-page-root");
    if (!container) return;

    // priorità: opzione esplicita > data-api-url scritto dal loader > default proxy
    const resolvedApiUrl = apiUrl ?? container.dataset.apiUrl ?? `/apps/chatbot${window.location.search}`;
    const resolvedGetCartId = getCartId ?? defaultGetCartId;
    const resolvedSetCartId = setCartId ?? defaultSetCartId;

    if (!root) root = createRoot(container);
    root.render(<ChatPage apiUrl={resolvedApiUrl} getCartId={resolvedGetCartId} setCartId={resolvedSetCartId} />);
  },
};
