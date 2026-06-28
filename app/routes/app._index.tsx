import { useState, useEffect, useMemo } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { listSystemPrompts, getActivePromptId, createSystemPrompt, updateSystemPrompt, setActivePromptId } from "../shopify/system-prompt.server";
import { EntrySelector } from "./components/EntrySelector";
import { Button, ErrorText } from "./components/basic-ui-components";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const [entries, activeId] = await Promise.all([
    listSystemPrompts(admin),
    getActivePromptId(admin),
  ]);

  return { entries, activeId };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    // rende attiva l'entry selezionata senza modificarne il contenuto
    if (intent === "activate") {
      const id = formData.get("id") as string;
      await setActivePromptId(admin, id);
      return Response.json({ ok: true, id });
    }

    // "save": aggiorna l'entry selezionata; "create": crea una nuova entry.
    // in entrambi i casi l'entry risultante diventa quella attiva.
    const content = formData.get("content") as string;
    const id = formData.get("id") as string | null;
    const targetId = intent === "save" && id
      ? (await updateSystemPrompt(admin, id, content), id)
      : await createSystemPrompt(admin, content);
    await setActivePromptId(admin, targetId);
    return Response.json({ ok: true, id: targetId });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};

export default function Index() {
  const { entries, activeId } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ ok: boolean; error?: string; id?: string }>();

  // entry attualmente selezionata. all'avvio è quella attiva (o la prima disponibile)
  const [selectedId, setSelectedId] = useState<string | null>(activeId ?? entries[0]?.id ?? null);
  // modalità creazione: si parte da contenuto vuoto. la nuova entry si crea solo con Save
  const [isCreating, setIsCreating] = useState(false);
  const selectedEntry = entries.find(e => e.id === selectedId) ?? null;
  const saved = useMemo(() => selectedEntry?.content ?? "", [selectedEntry]);

  const [prompt, setPrompt] = useState(saved);

  // ricarica l'editor quando cambia l'entry selezionata o quando il loader rivalida dopo un salvataggio.
  // in modalità creazione il contenuto è gestito a parte (vuoto), quindi non lo tocchiamo
  useEffect(() => {
    if (isCreating) return;
    setPrompt(saved);
  }, [selectedId, saved, isCreating]);

  // dopo un salvataggio/creazione l'entry risultante diventa quella attiva: la selezioniamo ed usciamo dalla creazione
  useEffect(() => {
    if (fetcher.data?.ok && fetcher.data.id) {
      setIsCreating(false);
      setSelectedId(fetcher.data.id);
    }
  }, [fetcher.data]);

  const isSaving = fetcher.state !== "idle";
  const isDirty = prompt !== saved;
  const saveError = fetcher.data?.ok === false ? fetcher.data.error : null;

  // in creazione salva sempre come nuova entry; altrimenti aggiorna la selezionata
  const handleSave = () => {
    const intent = isCreating || !selectedId ? "create" : "save";
    const payload: Record<string, string> = { intent, content: prompt };
    if (intent === "save" && selectedId) payload.id = selectedId;
    fetcher.submit(payload, { method: "POST" });
  };

  const handleNew = () => {
    setIsCreating(true);
    setSelectedId(null);
    setPrompt("");
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSelectedId(activeId ?? entries[0]?.id ?? null);
  };

  const handleSelect = (id: string) => {
    setIsCreating(false);
    setSelectedId(id);
  };

  const handleActivate = () => {
    if (selectedId) fetcher.submit({ intent: "activate", id: selectedId }, { method: "POST" });
  };

  return (
    <s-page heading="Conversational Storefront">
      <EntrySelector
        id="prompt-entry"
        heading="Active system prompt"
        entries={entries}
        activeId={activeId}
        selectedId={selectedId}
        isCreating={isCreating}
        busy={isSaving}
        onSelect={handleSelect}
        onActivate={handleActivate}
        onNew={handleNew}
        onCancel={handleCancel}
      />

      <s-section>
        <label htmlFor="system-prompt" style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>System prompt</label>
        <textarea
          id="system-prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={28}
          style={{
            width: "100%",
            maxHeight: "60vh",
            overflowY: "auto",
            fontFamily: `ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`,
            fontSize: "14px",
            lineHeight: 1.6,
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        {saveError && <ErrorText>{saveError}</ErrorText>}
        <Button variant="primary" onClick={handleSave} disabled={isSaving || !isDirty}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
