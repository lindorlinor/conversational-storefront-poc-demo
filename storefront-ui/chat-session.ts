const SESSION_KEY = "conversational-storefront:messages";
const DISMISSED_KEY = "conversational-storefront:dismissed";

export function loadMessages(shop: string) {
  try {
    const raw = sessionStorage.getItem(`${SESSION_KEY}:${shop}`);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function saveMessages(shop: string, messages: unknown[]) {
  try {
    sessionStorage.setItem(`${SESSION_KEY}:${shop}`, JSON.stringify(messages));
  } catch {
    // sessionStorage non disponibile (es. iframe con cookie bloccati)
  }
}

export function clearMessages(shop: string) {
  try {
    sessionStorage.removeItem(`${SESSION_KEY}:${shop}`);
    sessionStorage.removeItem(`${DISMISSED_KEY}:${shop}`);
  } catch {
    // ignore
  }
}

export function loadDismissed(shop: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(`${DISMISSED_KEY}:${shop}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function dismissToolCall(shop: string, toolCallId: string) {
  try {
    const dismissed = loadDismissed(shop);
    dismissed.add(toolCallId);
    sessionStorage.setItem(`${DISMISSED_KEY}:${shop}`, JSON.stringify([...dismissed]));
  } catch {
    // ignore
  }
}
