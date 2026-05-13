import { createRoot } from "react-dom/client";
import { ChatWidget } from "./ChatWidget";
import rawStyles from "./style.css?inline";

// metto le regole inline perchè ci sono problemi di priorità con le regole inline
// crea un elemento style
const styleEl = document.createElement("style");

// con una regex prende tutte le regole dentro @layer utilities (che sono quelle definite da tailwind) 
styleEl.textContent = rawStyles.replace(/@layer\s+utilities\s*\{([\s\S]*?)\}(?=\s*(?:@layer|$))/g, "$1");
// aggiunge l'elemento style al head del documento
document.head.appendChild(styleEl);


function mount() {
  const container = document.getElementById("chat-widget-root"); //qui dice prende il div in cui poi mette dentro il componente react
  if (container) {
    const apiUrl = container.dataset.apiUrl!;
    createRoot(container).render( //inserisce dentro il div il componente react
        <ChatWidget apiUrl={apiUrl} />
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
