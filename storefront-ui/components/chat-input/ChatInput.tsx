import { useState, useEffect } from "react";

export interface InputStyleConfig {
  container?: string;
  input?: string;
  button?: string;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  styleConfig?: InputStyleConfig;
  placeholders?: string[];
}

export const DEFAULT_STYLE_CONFIG: InputStyleConfig = {
  container:
    "flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 shadow-sm transition-colors focus-within:border-blue-400",
  input: "flex-1 bg-transparent text-sm text-gray-700 outline-none",
  button:
    "flex-shrink-0 cursor-pointer rounded-full bg-blue-500 p-2 text-white transition hover:bg-blue-600 disabled:cursor-default disabled:opacity-40",
};

export const DEFAULT_PLACEHOLDERS = [
  "Voglio saperne di più sui vostri prodotti.",
  "Consigliami un regalo per la festa della papà.",
  "Avete della cera?",
  "Avete uno snowboard liquid"
];

const CYCLE_INTERVAL_MS = 6000;
const FADE_DURATION_MS = 400;

export function ChatInput({
  onSend,
  disabled = false,
  styleConfig,
  placeholders,
}: ChatInputProps) {
  const config = { ...DEFAULT_STYLE_CONFIG, ...styleConfig };
  const texts = placeholders ?? DEFAULT_PLACEHOLDERS;

  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return;

    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % texts.length);
        setVisible(true);
      }, FADE_DURATION_MS);
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [texts.length, cycleKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim() || texts[placeholderIndex];
    onSend(text);
    setValue("");
    setPlaceholderIndex(0);
    setVisible(true);
    setCycleKey((k) => k + 1);
  };

  return (
    <form onSubmit={handleSubmit} className={config.container}>
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          placeholder=""
          className={`${config.input} w-full`}
        />
        {!value && (
          <span
            aria-hidden
            style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
            className={`pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm text-gray-400 transition-opacity ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {texts[placeholderIndex]}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled}
        className={config.button}
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
