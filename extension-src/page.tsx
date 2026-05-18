import { createRoot } from "react-dom/client";
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
  const apiUrl = `/apps/chatbot${window.location.search}`;
  createRoot(container).render(<ChatPage apiUrl={apiUrl} />);
}
