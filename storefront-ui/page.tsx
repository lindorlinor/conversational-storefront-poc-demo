import { createRoot, Root } from "react-dom/client";
import { ChatPage } from "./ChatPage";
import { cart } from "./cart";
import {
  registerComponents,
  getComponentSchemas,
  type MerchantComponent,
} from "./component-registry";
import rawStyles from "./page.css?inline";

const styleEl = document.createElement("style");
styleEl.textContent = rawStyles.replace(
  /@layer\s+utilities\s*\{([\s\S]*?)\}(?=\s*(?:@layer|$))/g,
  "$1"
);
document.head.appendChild(styleEl);


/* injecetTheme usato per iniettare il CSS del tema del merchant. Viene chiamato da */
function injectTheme(apiUrl: string): Promise<void> {
  const u = new URL(apiUrl, window.location.href);
  const themeUrl = u.origin + u.pathname.replace(/\/$/, "") + "/theme" + u.search;
  return fetch(themeUrl)
    .then((res) => (res.ok ? res.text() : ""))
    .then((css) => {
      if (!css) return;
      // rimuove un tema iniettato da una init precedente (re-mount SPA)
      const el = document.createElement("style");
      el.dataset.conversationalStorefrontTheme = "";
      el.textContent = css;
      document.head.appendChild(el);
    })
    .catch(() => {
      /* tema non disponibile: restano i default */
    });
}

interface InitOptions {
  apiUrl?: string;
  // valore iniziale: il widget poi lo aggiorna da solo e segnala i cambiamenti
  // con l'evento "conversational-storefront:cart-id-changed" (anche postMessage)
  cartId?: string | null;
  // componenti del merchant che sovrascrivono (stesso nome) o aggiungono
  // (nome nuovo) widget al registry: { component, schema, description }
  components?: Record<string, MerchantComponent>;
}

declare global {
  interface Window {
    ConversationalStorefront: { init: (options?: InitOptions) => void };
  }
}

let root: Root | null = null;
let mountedContainer: HTMLElement | null = null;

window.ConversationalStorefront = {
  init({ apiUrl, cartId, components }: InitOptions = {}) {
    const container = document.getElementById("chat-page-root");
    if (!container) return;

    // registra i componenti del merchant prima del render: il render loop li
    // userà per il lookup e i loro schemi viaggeranno nel body verso il backend
    registerComponents(components);

    // priorità: opzione esplicita > data-api-url scritto dal loader > default proxy
    const resolvedApiUrl = apiUrl ?? container.dataset.apiUrl ?? `/apps/chatbot${window.location.search}`;
    cart.init(cartId ?? null, resolvedApiUrl);

    /* nascosto perchè altrimenti flesha le persone */
    container.style.opacity = "0";
    injectTheme(resolvedApiUrl).finally(() => {
      container.style.opacity = "1";
    });

    // in una SPA il container può essere smontato e ricreato tra una init e l'altra
    if (!root || mountedContainer !== container) {
      root = createRoot(container);
      mountedContainer = container;
    }
    root.render(
      <ChatPage
        apiUrl={resolvedApiUrl}
        componentSchemas={getComponentSchemas()}
      />,
    );
  },
};
