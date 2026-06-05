import { useState, useEffect } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getThemeConfig } from "../shopify/theme.graphql";

type ThemeKey =
  | "color-widget-bg" | "color-widget-surface" | "color-widget-surface-alt"
  | "color-widget-text" | "color-widget-text-secondary" | "color-widget-text-muted" | "color-widget-text-icon"
  | "color-widget-border" | "color-widget-border-input"
  | "color-widget-accent" | "color-widget-accent-hover" | "color-widget-accent-fg"
  | "color-widget-disabled-bg" | "color-widget-disabled-fg" | "color-widget-error"
  | "radius-widget-base" | "radius-widget-full"
  | "text-widget-label" | "text-widget-caption" | "text-widget-body" | "text-widget-ui" | "text-widget-title"
  | "size-widget-dot-w" | "size-widget-dot-h";

const COLOR_KEYS = new Set<ThemeKey>([
  "color-widget-bg", "color-widget-surface", "color-widget-surface-alt",
  "color-widget-text", "color-widget-text-secondary", "color-widget-text-muted", "color-widget-text-icon",
  "color-widget-border", "color-widget-border-input",
  "color-widget-accent", "color-widget-accent-hover", "color-widget-accent-fg",
  "color-widget-disabled-bg", "color-widget-disabled-fg", "color-widget-error",
]);

const SECTIONS: { heading: string; keys: ThemeKey[] }[] = [
  { heading: "Sfondi",              keys: ["color-widget-bg", "color-widget-surface", "color-widget-surface-alt"] },
  { heading: "Testi",               keys: ["color-widget-text", "color-widget-text-secondary", "color-widget-text-muted", "color-widget-text-icon"] },
  { heading: "Bordi",               keys: ["color-widget-border", "color-widget-border-input"] },
  { heading: "Accent",              keys: ["color-widget-accent", "color-widget-accent-hover", "color-widget-accent-fg"] },
  { heading: "Stati",               keys: ["color-widget-disabled-bg", "color-widget-disabled-fg", "color-widget-error"] },
  { heading: "Arrotondamento",      keys: ["radius-widget-base", "radius-widget-full"] },
  { heading: "Tipografia",          keys: ["text-widget-label", "text-widget-caption", "text-widget-body", "text-widget-ui", "text-widget-title"] },
  { heading: "Indicatori galleria", keys: ["size-widget-dot-w", "size-widget-dot-h"] },
];

const ALL_KEYS = SECTIONS.flatMap(s => s.keys);
const EMPTY_THEME = Object.fromEntries(ALL_KEYS.map(k => [k, ""])) as Record<ThemeKey, string>;

const HEX6 = /^#[0-9a-fA-F]{6}$/;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const config = await getThemeConfig(admin);
  return { saved: config?.variant_selector ?? {} };
};

export default function StyleConfiguration() {
  const { saved } = useLoaderData<typeof loader>();
  const [theme, setTheme] = useState<Record<ThemeKey, string>>({ ...EMPTY_THEME, ...saved });

  useEffect(() => {
    setTheme({ ...EMPTY_THEME, ...saved });
  }, [saved]);

  const set = (key: ThemeKey, value: string) =>
    setTheme(t => ({ ...t, [key]: value }));

  const handleSave = () => {
    // TODO: salvare i valori nel metaobject Shopify
    console.log("TODO save theme", theme);
  };

  return (
    <s-page heading="Style configuration">
      {SECTIONS.map(({ heading, keys }) => (
        <s-section key={heading}>
          <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {heading}
          </p>
          {keys.map(key => {
            const value = theme[key];
            const isColor = COLOR_KEYS.has(key);
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 290, fontFamily: "monospace", fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>
                  --{key}
                </span>
                {isColor && (
                  <input
                    type="color"
                    value={HEX6.test(value) ? value : "#000000"}
                    onChange={e => set(key, e.target.value)}
                    style={{ width: 34, height: 28, padding: 2, border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", flexShrink: 0 }}
                  />
                )}
                <input
                  type="text"
                  value={value}
                  onChange={e => set(key, e.target.value)}
                  placeholder={isColor ? "#rrggbb" : "valore CSS"}
                  style={{ width: isColor ? 100 : 160, fontFamily: "monospace", fontSize: 13, padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, outline: "none" }}
                />
              </div>
            );
          })}
        </s-section>
      ))}

      <s-section>
        <button
          type="button"
          onClick={handleSave}
          style={{ padding: "8px 20px", background: "#111827", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          Salva
        </button>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};