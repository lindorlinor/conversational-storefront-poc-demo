import { createRoot, Root } from "react-dom/client";
import { ChatPage } from "./ChatPage";
import { cart } from "./cart";
import rawStyles from "./page.css?inline";

const styleEl = document.createElement("style");
styleEl.textContent = rawStyles.replace(
  /@layer\s+utilities\s*\{([\s\S]*?)\}(?=\s*(?:@layer|$))/g,
  "$1"
);
document.head.appendChild(styleEl);

interface InitOptions {
  apiUrl?: string;
  // valore iniziale: il widget poi lo aggiorna da solo e segnala i cambiamenti
  // con l'evento "conversational-storefront:cart-id-changed" (anche postMessage)
  cartId?: string | null;
}

declare global {
  interface Window {
    ConversationalStorefront: { init: (options?: InitOptions) => void };
  }
}

let root: Root | null = null;
let mountedContainer: HTMLElement | null = null;

window.ConversationalStorefront = {
  init({ apiUrl, cartId }: InitOptions = {}) {
    const container = document.getElementById("chat-page-root");
    if (!container) return;

    // priorità: opzione esplicita > data-api-url scritto dal loader > default proxy
    const resolvedApiUrl = apiUrl ?? container.dataset.apiUrl ?? `/apps/chatbot${window.location.search}`;
    cart.init(cartId ?? null, resolvedApiUrl);

    // in una SPA il container può essere smontato e ricreato tra una init e l'altra
    if (!root || mountedContainer !== container) {
      root = createRoot(container);
      mountedContainer = container;
    }
    root.render(<ChatPage apiUrl={resolvedApiUrl} />);
  },
};
