import { useEffect, useState } from "react";
import { ChatPage } from "./ChatPage";
import { cart } from "./cart";
import {
  registerComponents,
  getComponentSchemas,
  type MerchantComponent,
} from "./component-registry";
import rawStyles from "./page.css?inline";

/* differenza con page.tsx: non include react e non fa createRoot */

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

export interface ConversationalStorefrontProps {
  apiUrl?: string;
  cartId?: string | null;
  components?: Record<string, MerchantComponent>; //aggiunte props react rispetto page.tsx (che a pensarci dovrei rinominare liquid.tsx ? todo)
}

export function ConversationalStorefront({ apiUrl, cartId, components }: ConversationalStorefrontProps) {
  // registra i componenti del merchant prima del primo render di ChatPage.
  registerComponents(components);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    injectStyles();
    const resolvedApiUrl = apiUrl ?? `/apps/chatbot${window.location.search}`;
    cart.init(cartId ?? null, resolvedApiUrl);
    setReady(true);
  }, [apiUrl, cartId]);

  if (!ready) return null;

  const resolvedApiUrl = apiUrl ?? `/apps/chatbot${window.location.search}`;
  return (
    <ChatPage apiUrl={resolvedApiUrl} componentSchemas={getComponentSchemas()} />
  );
}

export default ConversationalStorefront;
