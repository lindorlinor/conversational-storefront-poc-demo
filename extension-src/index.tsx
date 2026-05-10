import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChatWidget } from "./ChatWidget";

function mount() {
  const container = document.getElementById("chat-widget-root");
  if (container) {
    const apiUrl = container.dataset.apiUrl || "/api/chat";
    createRoot(container).render(
      <StrictMode>
        <ChatWidget apiUrl={apiUrl} />
      </StrictMode>
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
