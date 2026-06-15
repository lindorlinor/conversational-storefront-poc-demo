import { useEffect, useState } from "react";
import { ChatPage } from "./ChatPage";
import { cart } from "./cart";
import {
  registerComponents,
  getComponentSchemas,
  type MerchantComponent,
} from "./component-registry";
import rawStyles from "./page.css?inline";

/* differenza con page.tsx: non include react e non fa createRoot, lo monta l'host */

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const styleEl = document.createElement("style");
  styleEl.textContent = rawStyles.replace(
    /@layer\s+utilities\s*\{([\s\S]*?)\}(?=\s*(?:@layer|$))/g,
    "$1",
  );
  document.head.appendChild(styleEl);
}

/* injectTheme: scarica e inietta il CSS del tema del merchant prima del render */
function injectTheme(apiUrl: string): Promise<void> {
  const u = new URL(apiUrl, window.location.href);
  const themeUrl =
    u.origin + u.pathname.replace(/\/$/, "") + "/theme" + u.search;
  console.log("[injectTheme] fetching theme CSS from:", themeUrl);
  return fetch(themeUrl)
    .then((res) => (res.ok ? res.text() : ""))
    .then((css) => {
      console.log(
        `[injectTheme] CSS ricevuto (${css.length} char):\n`,
        css || "(vuoto)",
      );
      if (!css) return;
      const el = document.createElement("style");
      el.dataset.conversationalStorefrontTheme = "";
      el.textContent = css;
      document.head.appendChild(el);
    })
    .catch(() => {
      /* tema non disponibile: restano i default */
    });
}

export interface ConversationalStorefrontProps {
  apiUrl?: string;
  cartId?: string | null;
  components?: Record<string, MerchantComponent>; //aggiunte props react rispetto page.tsx (che a pensarci dovrei rinominare liquid.tsx ? todo)
}

export function ConversationalStorefront({
  apiUrl,
  cartId,
  components,
}: ConversationalStorefrontProps) {
  const [ready, setReady] = useState(false);
  // opacity 0 finché il tema non è iniettato, così non flesha (solo se c'è un apiUrl da cui fetcharlo)
  const [opacity, setOpacity] = useState(apiUrl ? 0 : 1);

  useEffect(() => {
    injectStyles();
    // registra i componenti del merchant prima del primo render di ChatPage
    registerComponents(components);

    const resolvedApiUrl = apiUrl ?? `/apps/chatbot${window.location.search}`;
    cart.init(cartId ?? null, resolvedApiUrl);

    // se apiUrl è esplicito iniettiamo il tema del merchant; con il default proxy
    // il tema è già nella pagina iframe (api.chat.tsx) quindi non serve
    if (apiUrl) {
      injectTheme(apiUrl).finally(() => setOpacity(1));
    }

    setReady(true);
  }, [apiUrl, cartId, components]);

  if (!ready) return null;

  const resolvedApiUrl = apiUrl ?? `/apps/chatbot${window.location.search}`;
  return (
    <div style={{ opacity, transition: "opacity 120ms ease" }}>
      <ChatPage apiUrl={resolvedApiUrl} componentSchemas={getComponentSchemas()} />
    </div>
  );
}

export default ConversationalStorefront;
