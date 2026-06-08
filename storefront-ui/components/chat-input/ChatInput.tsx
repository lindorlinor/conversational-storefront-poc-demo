import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function ChatInput({ onSend, disabled = false, value, onChange }: ChatInputProps) {
  const [placeholder, setPlaceholder] = useState("Scrivi un messaggio...");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setPlaceholder(text);
    onChange("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-widget-base border border-widget-border bg-widget-bg px-4 py-2 shadow-sm transition-colors focus-within:border-widget-accent"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="font-widget-secondary flex-1 bg-transparent text-sm text-widget-text-secondary outline-none"
      />

      <button
        type="submit"
        disabled={disabled}
        className="flex-shrink-0 cursor-pointer rounded-widget-base bg-widget-accent p-2 text-widget-accent-fg transition hover:bg-black disabled:cursor-default disabled:opacity-40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </form>
  );
}
