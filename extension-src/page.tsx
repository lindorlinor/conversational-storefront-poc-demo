import { createRoot } from "react-dom/client";
import { TamboProvider } from "@tambo-ai/react";
import { ChatPage } from "./ChatPage";
import rawStyles from "./page.css?inline";

const styleEl = document.createElement("style");
styleEl.textContent = rawStyles.replace(
  /@layer\s+utilities\s*\{([\s\S]*?)\}(?=\s*(?:@layer|$))/g,
  "$1"
);
document.head.appendChild(styleEl);

const container = document.getElementById("chat-page-root");
if (container) {
  createRoot(container).render(
    <TamboProvider apiKey={import.meta.env.VITE_TAMBO_API_KEY} userKey="user-1">
      <ChatPage />
    </TamboProvider>
  );
}
