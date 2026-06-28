import { z } from "zod";

// todo pensare a modo per creare errore a compile time se manca una chiave o se ne aggiunge una nuova (rispetto @theme in page.css -> tutto deve corrispondere)
export type ThemeKey =
  | "color-widget-bg" | "color-widget-card" | "color-widget-surface"
  | "color-widget-text" | "color-widget-text-secondary" | "color-widget-text-muted"
  | "color-widget-border"
  | "color-widget-card-image" | "color-widget-card-image-border"
  | "color-widget-accent" | "color-widget-accent-fg"
  | "color-widget-error"
  | "radius-widget-base"
  | "radius-widget-card"
  | "size-widget-card"
  | "color-widget-scroll-fade"
  | "color-widget-section-1" | "color-widget-section-2"
  | "color-widget-section-border"
  | "color-widget-page-from" | "color-widget-page-to"
  | "font-widget-primary" | "font-widget-secondary";

export const COLOR_KEYS = new Set<ThemeKey>([
  "color-widget-bg", "color-widget-card", "color-widget-surface",
  "color-widget-text", "color-widget-text-secondary", "color-widget-text-muted",
  "color-widget-border", "color-widget-section-border",
  "color-widget-card-image", "color-widget-card-image-border",
  "color-widget-accent", "color-widget-accent-fg",
  "color-widget-error",
  "color-widget-section-1", "color-widget-section-2",
  "color-widget-page-from", "color-widget-page-to",
]);

export const SECTIONS: { heading: string; keys: ThemeKey[] }[] = [
  { heading: "Backgrounds",    keys: ["color-widget-bg", "color-widget-card", "color-widget-surface"] },
  { heading: "Text",           keys: ["color-widget-text", "color-widget-text-secondary", "color-widget-text-muted"] },
  { heading: "Borders",        keys: ["color-widget-border", "color-widget-section-border"] },
  { heading: "Image card",     keys: ["color-widget-card-image", "color-widget-card-image-border"] },
  { heading: "Accent",         keys: ["color-widget-accent", "color-widget-accent-fg"] },
  { heading: "Error",          keys: ["color-widget-error"] },
  { heading: "Radius",         keys: ["radius-widget-base", "radius-widget-card"] },
  { heading: "Sizes",          keys: ["size-widget-card"] },
  { heading: "Scroll fade",    keys: ["color-widget-scroll-fade"] },
  { heading: "Sections",       keys: ["color-widget-section-1", "color-widget-section-2"] },
  { heading: "Page background",keys: ["color-widget-page-from", "color-widget-page-to"] },
  { heading: "Font",           keys: ["font-widget-primary", "font-widget-secondary"] },
];

export const THEME_DESCRIPTIONS: Record<ThemeKey, string> = {
  "color-widget-bg": "sfondo principale di un widget",
  "color-widget-card": "sfondo delle card prodotto",
  "color-widget-surface": "colore di sfondo secondario usato per contrasto con il bg principale, es. per evidenziare sezioni o come sfondo di bottoni secondari",
  "color-widget-text": "colore del testo principale. Usato principalmente per titoli e testi importanti",
  "color-widget-text-secondary": "colore del testo secondario, usato per elementi meno importanti o descrizioni",
  "color-widget-text-muted": "colore del testo tenue, usato per elementi ancora meno importanti",
  "color-widget-border": "colore dei bordi dei widget",
  "color-widget-card-image": "colore di sfondo dietro le immagini dei prodotti. Usato soprattutto per i prodotti con immagini trasparenti.",
  "color-widget-card-image-border": "colore del bordo delle immagini dei prodotti. In particolare usato se il bordo della card non è presente",
  "color-widget-accent": "colore di sfondo del pulsante 'Aggiungi al carrello' o equivalente CTA principale. REGOLA: guarda il colore fisico dello sfondo del pulsante nell'immagine — se il pulsante ha lo sfondo bianco metti #ffffff, se è verde metti il verde esatto, ecc. Non usare il colore del testo né colori del brand/logo: solo lo sfondo visibile del pulsante.",
  "color-widget-accent-fg": "colore del testo sopra i pulsanti primari (accent). Se accent è chiaro/bianco usa un testo scuro (#111111 o simile), se accent è scuro usa bianco (#ffffff). Deve avere contrasto sufficiente con accent.",
  "color-widget-error": "colore usato per evidenziare errori, ad esempio nei form",
  "radius-widget-base": "raggio di arrotondamento base, usato per bottoni e altri elementi (non per le card prodotto)",
  "radius-widget-card": "raggio di arrotondamento delle card prodotto, indipendente dal raggio base",
  "size-widget-card": "dimensione delle card dei prodotti",
  "color-widget-scroll-fade": "colore usato per l'effetto fade quando la sezione è scrollabile orizzontalmente. Può essere trasparente se non si vuole un effetto fade",
  "color-widget-section-1": "colore di sfondo alternativo usato per evidenziare le sezioni",
  "color-widget-section-2": "colore di sfondo alternativo usato per evidenziare le sezioni. Se si vuole un effetto a bande si può usare transparent e valorizzare solo section-1",
  "color-widget-section-border": "colore del bordo che separa le sezioni",
  "color-widget-page-from": "colore di sfondo principale della pagina",
  "color-widget-page-to": "colore di sfondo secondario della pagina, usato per creare un effetto sfumato con page-from",
  "font-widget-primary": "font principale del widget, usato per titoli e testi importanti",
  "font-widget-secondary": "font secondario del widget, usato per testi secondari come descrizioni",
};

export const ALL_KEYS = SECTIONS.flatMap(s => s.keys);

// tema con tutte le chiavi ma valori vuoti: semplifica l'override solo di alcune proprietà senza dover gestire le chiavi mancanti
export const EMPTY_THEME = Object.fromEntries(ALL_KEYS.map(k => [k, ""])) as Record<ThemeKey, string>;

export const HEX6 = /^#[0-9a-fA-F]{6}$/;

const themeSchemaShape = Object.fromEntries(
  ALL_KEYS.map(key => [key, z.string().nullable().describe(THEME_DESCRIPTIONS[key])]),
) as Record<ThemeKey, z.ZodNullable<z.ZodString>>;

export const themeSchema = z.object(themeSchemaShape);
