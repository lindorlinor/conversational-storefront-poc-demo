import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { ProductCard } from "./components";
// import { m } from "node_modules/react-router/dist/development/index-react-server-client-Ck_yZ1qL.mjs";
export function ChatWidget({ apiUrl }: { apiUrl: string }) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: apiUrl }),
  });

  const [input, setInput] = useState("");

  return (
    
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "360px",
        background: "white",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e0e0e0",
          fontWeight: 600,
          fontSize: "15px",
        }}
        >
        Chat
      </div>
        

      <div
        style={{
          overflowY: "auto",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          height: "400px",
        }}
      >

        {messages.map((message): null => {
          console.log(message);
          return null;
        })}
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: message.role === "user" ? "#000" : "#f0f0f0",
              color: message.role === "user" ? "#fff" : "#000",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            {message.parts.map((part, i) => {
              if (part.type === "text") return <span key={i}>{part.text}</span>
              if (part.type === "dynamic-tool" && part.state === "output-available") {
                const output = part.output as { content: { text: string }[] }
                const data = JSON.parse(output.content[0].text)
                return data.products.map((p: { id: string; title: string ; media: { url: string }[] }) => (
                  <ProductCard key={p.id} id={p.id} title={p.title} imgUrl={p.media[0].url} />
                ))
              }
              return null
            })}
          </div>
        ))}
        {(status === "streaming" || status === "submitted") && (
          <div
            style={{
              alignSelf: "flex-start",
              background: "#f0f0f0",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#999",
            }}
          >
            ...
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #e0e0e0",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scrivi un messaggio..."
          style={{
            flex: 1,
            padding: "8px 10px",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Invia
        </button>
      </form>
    </div>
  );
}
