import type { ReactNode } from "react";

export function isInputReady(state?: string) {
  return state === "input-available" || state === "output-available";
}

export function LabelSkeleton({ width = "5rem" }: { width?: string }) {
  return (
    <span
      aria-hidden
      className="tw:inline-block tw:align-middle tw:h-[0.9em] tw:rounded tw:bg-widget-text-muted tw:opacity-30 tw:animate-pulse"
      style={{ width }}
    />
  );
}

// `text` è già tradotto (t("...")). Mostra lo skeleton finché l'input del tool
// non è pronto, poi rivela il testo tradotto.
export function label(
  text: string,
  state: string | undefined,
  skeletonWidth?: string,
): ReactNode {
  return isInputReady(state) ? text : <LabelSkeleton width={skeletonWidth} />;
}
