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
      className="tw:flex tw:items-center tw:gap-2 tw:rounded-widget-base tw:border tw:border-widget-border tw:bg-widget-bg tw:px-4 tw:py-2 tw:shadow-sm tw:transition-colors tw:focus-within:border-widget-accent"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="tw:font-widget-secondary tw:flex-1 tw:bg-transparent tw:text-sm tw:text-widget-text-secondary tw:outline-none"
      />

      <button
        type="submit"
        disabled={disabled}
        className="tw:flex-shrink-0 tw:cursor-pointer tw:rounded-widget-base tw:bg-widget-accent tw:p-2 tw:text-widget-accent-fg tw:border tw:border-widget-accent-fg tw:transition tw:hover:bg-black tw:disabled:cursor-default tw:disabled:opacity-40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="tw:h-4 tw:w-4"
        >
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </form>
  );
}
