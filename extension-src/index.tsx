import { createRoot } from "react-dom/client";
import { ChatWidget } from "./ChatWidget";

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
