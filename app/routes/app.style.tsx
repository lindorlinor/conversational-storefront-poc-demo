import { useState, useEffect } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getThemeConfig, createThemeConfig } from "../shopify/theme.graphql";
import { extract, render } from "designlang/api";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";


// todo pensare a modo per creare errore a compile time se manca una chiave o se ne aggiunge una nuova (rispetto @theme in page.css -> tutto deve corrispondere)
type ThemeKey =
  | "color-widget-bg" | "color-widget-card" | "color-widget-surface"
  | "color-widget-text" | "color-widget-text-secondary" | "color-widget-text-muted"
  | "color-widget-border"
  | "color-widget-card-image" | "color-widget-card-image-border"
  | "color-widget-accent" | "color-widget-accent-fg"
  | "color-widget-error"
  | "radius-widget-base"
  | "size-widget-card"
  | "color-widget-scroll-fade"
  | "color-widget-section-1" | "color-widget-section-2"
  | "color-widget-section-border"
  | "color-widget-page-from" | "color-widget-page-to"
  | "font-widget-primary" | "font-widget-secondary";

const COLOR_KEYS = new Set<ThemeKey>([
  "color-widget-bg", "color-widget-card", "color-widget-surface",
  "color-widget-text", "color-widget-text-secondary", "color-widget-text-muted",
  "color-widget-border", "color-widget-section-border",
  "color-widget-card-image", "color-widget-card-image-border",
  "color-widget-accent", "color-widget-accent-fg",
  "color-widget-error",
  "color-widget-section-1", "color-widget-section-2",
  "color-widget-page-from", "color-widget-page-to",
]);

const SECTIONS: { heading: string; keys: ThemeKey[] }[] = [
  { heading: "Sfondi",         keys: ["color-widget-bg", "color-widget-card", "color-widget-surface"] },
  { heading: "Testi",          keys: ["color-widget-text", "color-widget-text-secondary", "color-widget-text-muted"] },
  { heading: "Bordi",          keys: ["color-widget-border", "color-widget-section-border"] },
  { heading: "Card immagine",  keys: ["color-widget-card-image", "color-widget-card-image-border"] },
  { heading: "Accent",         keys: ["color-widget-accent", "color-widget-accent-fg"] },
  { heading: "Errore",         keys: ["color-widget-error"] },
  { heading: "Arrotondamento", keys: ["radius-widget-base"] },
  { heading: "Dimensioni",     keys: ["size-widget-card"] },
  { heading: "Scroll fade",    keys: ["color-widget-scroll-fade"] },
  { heading: "Sezioni",        keys: ["color-widget-section-1", "color-widget-section-2"] },
  { heading: "Sfondo pagina",  keys: ["color-widget-page-from", "color-widget-page-to"] },
  { heading: "Font",           keys: ["font-widget-primary", "font-widget-secondary"] },
];

const ALL_KEYS = SECTIONS.flatMap(s => s.keys);
const EMPTY_THEME = Object.fromEntries(ALL_KEYS.map(k => [k, ""])) as Record<ThemeKey, string>;

const HEX6 = /^#[0-9a-fA-F]{6}$/;

const themeSchemaShape = Object.fromEntries(
  ALL_KEYS.map(key => [key, z.string().nullable()]),
) as Record<ThemeKey, z.ZodNullable<z.ZodString>>;

const themeSchema = z.object(themeSchemaShape);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const result = await getThemeConfig(admin);

  // per ora prendo direttamente variant_selector
  return { saved: result?.theme.variant_selector ?? {} };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "extract") {
    const url = formData.get("url") as string;
    try {
      const design = await extract(url);
      const tokens = render("dtcg", design) as string;

      const { output } = await generateText({
        model: openai("gpt-4.1-nano"),
        output: Output.object({ schema: themeSchema }),
        prompt: `Dato questo JSON DTCG estratto dal sito del merchant:\n${tokens}\n\nMappalo sulle variabili CSS del widget. Restituisci solo i valori che riesci a mappare con confidenza.`,
      });

      const theme = Object.fromEntries(
        Object.entries(output).filter(([, v]) => v !== null && v !== ""),
      ) as Record<ThemeKey, string>;

      return Response.json({ ok: true, theme });
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
    }
  }

  const raw = formData.get("theme") as string;
  try {
    const variant_selector = JSON.parse(raw) as Record<string, string>;
    await createThemeConfig(admin, { variant_selector });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};

export default function StyleConfiguration() {
  const { saved } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const extractFetcher = useFetcher<{ ok: boolean; error?: string; theme?: Record<ThemeKey, string> }>();

  // con empty theme intendo un tema con tutte le chiavi ma valori vuoti, in questo modo è più semplice fare l'override solo di alcune proprietà senza dover gestire i casi in cui mancano
  const [theme, setTheme] = useState<Record<ThemeKey, string>>({ ...EMPTY_THEME, ...saved });
  const [url, setUrl] = useState("");

  useEffect(() => {
    setTheme({ ...EMPTY_THEME, ...saved });
  }, [saved]);

  const set = (key: ThemeKey, value: string) =>
    setTheme(t => ({ ...t, [key]: value }));

  const isSaving = fetcher.state !== "idle";
  const isDirty = ALL_KEYS.some(k => theme[k] !== (saved[k] ?? ""));
  const saveError = fetcher.data?.ok === false ? fetcher.data.error : null;

  const handleSave = () => {
    const toSave = Object.fromEntries(Object.entries(theme).filter(([, v]) => v !== ""));
    fetcher.submit(
      { theme: JSON.stringify(toSave) },
      { method: "POST" },
    );
  };

  const isExtracting = extractFetcher.state !== "idle";

  const handleExtract = () => {
    extractFetcher.submit(
      { intent: "extract", url },
      { method: "POST" },
    );
  };

  useEffect(() => {
    if (extractFetcher.data?.ok && extractFetcher.data.theme) {
      setTheme(t => ({ ...t, ...extractFetcher.data!.theme }));
    }
  }, [extractFetcher.data]);

  return (
    <s-page heading="Style configuration">
      <s-section>
        <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Estrattore design system
          </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }} htmlFor="generate-url">
            Url della pagina
          </label>
          <input
            id="generate-url" type="text" value={url} onChange={e => setUrl(e.target.value)} style={{ flex: 1, fontSize: 13, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 4, outline: "none" }}/>
          <button type="button" onClick={handleExtract} disabled={isExtracting || !url} style={{ padding: "8px 20px", background: "#111827", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: (isExtracting || !url) ? "default" : "pointer", opacity: (isExtracting || !url) ? 0.5 : 1 }}>
            {isExtracting ? "Estrazione..." : "Estrai design system"}
          </button>
        </div>
        {extractFetcher.data?.ok === false && (
          <p style={{ marginTop: 12, fontSize: 13, color: "#dc2626" }}>{extractFetcher.data.error}</p>
        )}
        {extractFetcher.data?.ok && extractFetcher.data.theme && (
          <pre style={{ marginTop: 12, padding: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, overflowX: "auto" }}>
            {JSON.stringify(extractFetcher.data.theme, null, 2)}
          </pre>
        )}

      </s-section>

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
        {saveError && (
          <p style={{ marginBottom: 12, fontSize: 13, color: "#dc2626" }}>{saveError}</p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          style={{ padding: "8px 20px", background: "#111827", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: (isSaving || !isDirty) ? "default" : "pointer", opacity: (isSaving || !isDirty) ? 0.5 : 1 }}
        >
          {isSaving ? "Salvataggio..." : "Salva"}
        </button>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
