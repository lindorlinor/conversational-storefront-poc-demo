import { useState } from "react";
import type { ActionFunctionArgs, HeadersFunction } from "react-router";
import { useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { extract, render } from "designlang/api";

const DAINESE_URL = "https://www.dainese.com/it/it/";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  try {
    const design = await extract(DAINESE_URL);
    const cssVars = render("css-vars", design) as string;
    const agentPrompt = render("agent-prompt", design) as string;
    const tokens = render("dtcg", design) as string;
    const tailwindV3 = render("tailwind", design) as string;
    const tailwindV4 = render("tailwind-v4", design) as string;
    return Response.json({ ok: true, cssVars, agentPrompt, tokens, tailwindV3, tailwindV4 });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};

type ActionData =
  | { ok: true; cssVars: string; agentPrompt: string; tokens: string; tailwindV3: string; tailwindV4: string }
  | { ok: false; error: string };

export default function DesignSystem() {
  const fetcher = useFetcher<ActionData>();
  const [copied, setCopied] = useState<string | null>(null);

  const isLoading = fetcher.state !== "idle";
  const data = fetcher.data;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <s-page heading="Design system brand">
      <s-section>
        <p style={{ marginBottom: "16px", color: "#6d7175" }}>
          Estrae il design system da <strong>{DAINESE_URL}</strong> e genera le variabili CSS,
          il prompt per l'agente e i token DTCG.
        </p>
        <fetcher.Form method="post">
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Generazione in corso..." : "Genera"}
          </button>
        </fetcher.Form>

        {data && !data.ok && (
          <p style={{ color: "red", marginTop: "12px" }}>Errore: {data.error}</p>
        )}
      </s-section>

      {data && data.ok && (
        <>
          <s-section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label htmlFor="css-vars" style={{ fontWeight: 500 }}>CSS Variables</label>
              <button type="button" onClick={() => handleCopy(data.cssVars, "css")}>
                {copied === "css" ? "Copiato!" : "Copia"}
              </button>
            </div>
            <textarea
              id="css-vars"
              readOnly
              value={data.cssVars}
              rows={12}
              style={{ width: "100%", fontFamily: "monospace", fontSize: "12px", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", resize: "vertical", boxSizing: "border-box" }}
            />
          </s-section>

          <s-section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label htmlFor="agent-prompt" style={{ fontWeight: 500 }}>Agent Prompt</label>
              <button type="button" onClick={() => handleCopy(data.agentPrompt, "agent")}>
                {copied === "agent" ? "Copiato!" : "Copia"}
              </button>
            </div>
            <textarea
              id="agent-prompt"
              readOnly
              value={data.agentPrompt}
              rows={12}
              style={{ width: "100%", fontFamily: "monospace", fontSize: "12px", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", resize: "vertical", boxSizing: "border-box" }}
            />
          </s-section>

          <s-section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label htmlFor="dtcg-tokens" style={{ fontWeight: 500 }}>Token DTCG (JSON)</label>
              <button type="button" onClick={() => handleCopy(data.tokens, "tokens")}>
                {copied === "tokens" ? "Copiato!" : "Copia"}
              </button>
            </div>
            <textarea
              id="dtcg-tokens"
              readOnly
              value={data.tokens}
              rows={12}
              style={{ width: "100%", fontFamily: "monospace", fontSize: "12px", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", resize: "vertical", boxSizing: "border-box" }}
            />
          </s-section>

          <s-section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label htmlFor="tailwind-v3" style={{ fontWeight: 500 }}>Tailwind v3 (tailwind.config.js)</label>
              <button type="button" onClick={() => handleCopy(data.tailwindV3, "tw3")}>
                {copied === "tw3" ? "Copiato!" : "Copia"}
              </button>
            </div>
            <textarea
              id="tailwind-v3"
              readOnly
              value={data.tailwindV3}
              rows={12}
              style={{ width: "100%", fontFamily: "monospace", fontSize: "12px", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", resize: "vertical", boxSizing: "border-box" }}
            />
          </s-section>

          <s-section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label htmlFor="tailwind-v4" style={{ fontWeight: 500 }}>Tailwind v4 (@theme block)</label>
              <button type="button" onClick={() => handleCopy(data.tailwindV4, "tw4")}>
                {copied === "tw4" ? "Copiato!" : "Copia"}
              </button>
            </div>
            <textarea
              id="tailwind-v4"
              readOnly
              value={data.tailwindV4}
              rows={12}
              style={{ width: "100%", fontFamily: "monospace", fontSize: "12px", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", resize: "vertical", boxSizing: "border-box" }}
            />
          </s-section>
        </>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
