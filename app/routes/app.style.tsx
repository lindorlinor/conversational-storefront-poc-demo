import { useState, useEffect, useRef } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getThemeConfig, createThemeConfig } from "../shopify/theme.graphql";
import { extract, render } from "designlang/api";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";


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


const THEME_DESCRIPTIONS: Record<ThemeKey, string> = {
  "color-widget-bg": "sfondo principale di un widget",
  "color-widget-card": "sfondo delle card prodotto",
  "color-widget-surface": "colore di sfondo secondario usato per contrasto con il bg principale, es. per evidenziare sezioni o come sfondo di bottoni secondari",
  "color-widget-text": "colore del testo principale. Usato principalmente per titoli e testi importanti",
  "color-widget-text-secondary": "colore del testo secondario, usato per elementi meno importanti o descrizioni",
  "color-widget-text-muted": "colore del testo tenue, usato per elementi ancora meno importanti",
  "color-widget-border": "colore dei bordi dei widget",
  "color-widget-card-image": "colore di sfondo dietro le immagini dei prodotti. Usato soprattutto per i prodotti con immagini trasparenti.",
  "color-widget-card-image-border": "colore del bordo delle immagini dei prodotti. In particolare usato se il bordo della card non è presente",
  "color-widget-accent": "colore principale del brand, usato per CTA e bottoni primari",
  "color-widget-accent-fg": "testo sopra il colore accent, di solito bianco o nero",
  "color-widget-error": "colore usato per evidenziare errori, ad esempio nei form",
  "radius-widget-base": "raggio di arrotondamento base, usato per card e bottoni",
  "size-widget-card": "dimensione delle card dei prodotti",
  "color-widget-scroll-fade": "colore usato per l'effetto fade quando la sezione è scrollabile orizzontalmente. Può essere trasparente se non si vuole un effetto fade",
  "color-widget-section-1": "colore di sfondo alternativo usato per evidenziare le sezioni",
  "color-widget-section-2": "colore di sfondo alternativo usato per evidenziare le sezioni. Se si vuole un effetto a bande si può usare transparent e valorizzare solo section-1",
  "color-widget-section-border": "colore del bordo che separa le sezioni",
  "color-widget-page-from" : "colore di sfondo principale della pagina",
  "color-widget-page-to" : "colore di sfondo secondario della pagina, usato per creare un effetto sfumato con page-from",
  "font-widget-primary": "font principale del widget, usato per titoli e testi importanti",
  "font-widget-secondary": "font secondario del widget, usato per testi secondari come descrizioni",

};


const ALL_KEYS = SECTIONS.flatMap(s => s.keys);
const EMPTY_THEME = Object.fromEntries(ALL_KEYS.map(k => [k, ""])) as Record<ThemeKey, string>;

const HEX6 = /^#[0-9a-fA-F]{6}$/;

const themeSchemaShape = Object.fromEntries(
  ALL_KEYS.map(key => [key, z.string().nullable().describe(THEME_DESCRIPTIONS[key])]),
) as Record<ThemeKey, z.ZodNullable<z.ZodString>>;

const themeSchema = z.object(themeSchemaShape);

// ho bisogno di loggare le estrazioni per verificare se fa schifo il modello, l'estrazione oppure la combinazione di entrambi lol
async function logExtraction(url: string, tokens: string) {
  const logsDir = path.join(process.cwd(), "logs");
  await mkdir(logsDir, { recursive: true });
  await appendFile(
    path.join(logsDir, "extractions.jsonl"),
    JSON.stringify({ timestamp: new Date().toISOString(), url, tokens: JSON.parse(tokens) }) + "\n",
    "utf-8",
  );
}

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

      await logExtraction(url, tokens);

      const { output } = await generateText({
        model: openai("gpt-5-nano"),
        output: Output.object({ schema: themeSchema }),
        prompt: `Dato questo JSON DTCG estratto dal sito del merchant:\n${tokens}\n\nMappalo sulle variabili CSS del widget.\n\nPer i colori, restituisci ESCLUSIVAMENTE uno di questi formati:\n- un valore esadecimale concreto nel formato #rrggbb (es. "#ffffff"), risolvendo eventuali riferimenti a variabili/token del sito al loro valore finale\n- la stringa "transparent" se il colore corrispondente nel sito è trasparente o assente\n- null se non riesci a mappare il valore con confidenza\n\nNon restituire MAI riferimenti CSS come var(--...), nomi di token, o altri costrutti: solo hex, "transparent" o null.\n\nPer le proprietà non di colore restituisci il valore CSS concreto (es. dimensioni in px/rem) o null.`,
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

  // tema più recente ottenuto da un'estrazione: va riapplicato sopra "saved" quando il loader rivalida dopo l'action,
  // altrimenti l'effect su "saved" sovrascriverebbe i valori appena estratti con quelli salvati nel DB
  const extractedThemeRef = useRef<Record<ThemeKey, string> | null>(null);

  useEffect(() => {
    setTheme({ ...EMPTY_THEME, ...saved, ...extractedThemeRef.current });
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
      extractedThemeRef.current = extractFetcher.data.theme;
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
