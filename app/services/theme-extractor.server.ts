import { extract, render } from "designlang/api";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { themeSchema, type ThemeKey } from "../theme/theme.tokens";

interface ExtractInput {
  url?: string | null;
  files: File[];
}

type ImagePart = { type: "image"; image: Uint8Array; mediaType: `image/${string}` };

async function resolveTokens({ url }: ExtractInput): Promise<string> {
  if (url) {
    const design = await extract(url);
    return render("dtcg", design) as string; //estrattore designlang
  }
  return "";
}

async function toImageParts(files: File[]): Promise<ImagePart[]> {
  return Promise.all(
    files
      .filter(f => f.size > 0 && f.type.startsWith("image/"))
      .map(async f => ({
        type: "image" as const,
        image: new Uint8Array(await f.arrayBuffer()),
        mediaType: f.type as `image/${string}`,
      })),
  );
}

function buildSystemPrompt(hasImages: boolean): string {
  return `Sei un esperto di design system. Il tuo compito è mappare i token di design di un sito merchant sulle variabili CSS di un widget di chat e-commerce, replicando fedelmente lo stile visivo del sito.${hasImages ? " Sono stati allegati screenshot del sito: questi sono la tua fonte primaria di verità. Il tuo obiettivo è replicare l'aspetto del sito il più fedelmente possibile. Presta particolare attenzione ai pulsanti/CTA: rileva con precisione il colore di sfondo, il colore del testo e il raggio di arrotondamento esatti così come appaiono negli screenshot. Analizza anche sfondi, card, testi e bordi. I token JSON sono un supporto secondario: usali solo per dettagli non chiaramente visibili negli screenshot o per valori non cromatici. Se c'è qualsiasi contraddizione tra token e screenshot, l'immagine ha sempre priorità assoluta." : ""}`;
}

function buildUserPrompt(tokens: string, hasImages: boolean): string {
  return `Dato questo JSON DTCG estratto dal sito del merchant:
        \n${tokens}\n\nMappalo sulle variabili CSS del widget.\n\n
        Per i colori, restituisci ESCLUSIVAMENTE uno di questi formati:
        \n- un valore esadecimale concreto nel formato #rrggbb (es. "#ffffff"), risolvendo eventuali riferimenti a variabili/token del sito al loro valore finale
        \n- la stringa "transparent" se il colore corrispondente nel sito è trasparente o assente
        \n- null se non riesci a mappare il valore con confidenza
        \n\nNon restituire MAI riferimenti CSS come var(--...), nomi di token, o altri costrutti: solo hex, "transparent" o null.
        \n\nPer le proprietà non di colore restituisci il valore CSS concreto (es. dimensioni in px/rem) o null.\n\n
        Fai attenzione a non mettere valori che potrebbero causare problemi di accessibilità.${hasImages ? "\n\nHo allegato screenshot del sito. IMPORTANTE: guarda il colore di sfondo dei pulsanti principali (add to cart, checkout, CTA) nell'immagine e usalo per color-widget-accent — ignora qualsiasi valore ricavato dai token JSON per questa variabile se contraddice ciò che vedi nell'immagine." : ""}`;
}


export async function extractTheme(input: ExtractInput): Promise<Record<ThemeKey, string>> {
  const tokens = await resolveTokens(input);

  console.log(`[extract] file ricevuti: ${input.files.length} (${input.files.map(f => `${f.name} ${f.type} ${f.size}B`).join(', ') || 'nessuno'})`);
  const imageparts = await toImageParts(input.files);
  console.log(`[extract] immagini passate al modello: ${imageparts.length}`);

  const { output } = await generateText({
    model: openai("gpt-4.1"),
    output: Output.object({ schema: themeSchema }),
    system: buildSystemPrompt(imageparts.length > 0),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildUserPrompt(tokens, imageparts.length > 0) },
          ...imageparts,
        ],
      },
    ],
  });

  return Object.fromEntries(
    Object.entries(output).filter(([, v]) => v !== null && v !== ""),
  ) as Record<ThemeKey, string>;
}
