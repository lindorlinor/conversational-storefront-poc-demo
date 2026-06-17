import { useEffect, useState } from "react";
import { ChatPage } from "./ChatPage";
import { cart } from "./cart";
import {
  registerComponents,
  getComponentSchemas,
  type MerchantComponent,
} from "./component-registry";
import rawStyles from "./page.css?inline";


// Scoperchia il blocco `@layer utilities { ... }`: le regole dentro un @layer
// hanno priorità più bassa di qualsiasi regola non-layered del merchant, quindi
// le nostre utility devono uscire dal layer per vincere quando il bundle è
// iniettato in una pagina di terzi. NON si può usare una regex: il blocco
// contiene graffe annidate (@media(hover:hover){...} per le varianti tw:hover:),
// quindi bilanciamo le graffe a mano per trovare la chiusura corretta.
function unwrapUtilitiesLayer(css: string): string {
  const open = css.indexOf("@layer utilities{");
  if (open === -1) return css;
  const bodyStart = open + "@layer utilities{".length;
  let depth = 1;
  let i = bodyStart;
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") depth--;
  }
  if (depth !== 0) return css; // graffe sbilanciate: meglio non toccare
  const body = css.slice(bodyStart, i - 1); // contenuto senza la } di chiusura
  return css.slice(0, open) + body + css.slice(i);
}

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const styleEl = document.createElement("style");
  styleEl.dataset.conversationalStorefrontBundle = "";
  styleEl.textContent = unwrapUtilitiesLayer(rawStyles);
  document.head.appendChild(styleEl);
}

/* injectTheme: scarica e inietta il CSS custom (configurato nella area admin dell'app) */
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
      // il :root del tema deve SEMPRE venire dopo lo style del bundle, così a
      // parità di specificità le variabili del merchant vincono. Ancoriamo dopo
      // l'elemento del bundle invece di affidarci all'ordine di append (che
      // dipende dai tempi del fetch).
      const bundleEl = document.head.querySelector(
        "style[data-conversational-storefront-bundle]",
      );
      if (bundleEl) bundleEl.after(el);
      else document.head.appendChild(el);
    })
    .catch(() => {
      /* tema non disponibile: restano i default */
    });
}

export interface ConversationalStorefrontProps {
  apiUrl: string;
  cartId?: string | null;
  components?: Record<string, MerchantComponent>; //aggiunte props react rispetto page.tsx (che a pensarci dovrei rinominare liquid.tsx ? todo)
  country?: string;
  language?: string;
}

export function ConversationalStorefront({
  apiUrl,
  cartId,
  components,
  country,
  language,
}: ConversationalStorefrontProps) {
  const [ready, setReady] = useState(false);
  // opacity 0 finché il tema non è iniettato, così non flesha
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    injectStyles();
    // registra i componenti del merchant prima del primo render di ChatPage
    registerComponents(components);

    cart.init(cartId ?? null, apiUrl);

    injectTheme(apiUrl).finally(() => setOpacity(1));

    setReady(true);
  }, [apiUrl, cartId, components]);

  if (!ready) return null;

  return (
    <div style={{ opacity, transition: "opacity 120ms ease" }}>
      <ChatPage apiUrl={apiUrl} componentSchemas={getComponentSchemas()} country={country} language={language} />
    </div>
  );
}

export default ConversationalStorefront;
