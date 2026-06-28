import { useState, useEffect, useMemo } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { createThemeConfig, updateThemeConfig, setActiveThemeId, listThemeConfigs, getActiveThemeId } from "../shopify/theme.server";
import { extractTheme } from "../services/theme-extractor.server";
import { ALL_KEYS, EMPTY_THEME, type ThemeKey } from "../theme/theme.tokens";
import { ThemeEntrySelector } from "./components/ThemeEntrySelector";
import { ThemeExtractor } from "./components/ThemeExtractor";
import { ThemeFieldGrid } from "./components/ThemeFieldGrid";
import { Button, ErrorText } from "./components/basic-ui-components";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const [entries, activeId] = await Promise.all([
    listThemeConfigs(admin),
    getActiveThemeId(admin),
  ]);

  return { entries, activeId };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "extract") {
      const theme = await extractTheme({
        url: formData.get("url") as string | null,
        files: formData.getAll("files") as File[],
      });
      return Response.json({ ok: true, theme });
    }

    if (intent === "activate") {
      const id = formData.get("id") as string;
      await setActiveThemeId(admin, id);
      return Response.json({ ok: true, id });
    }

    
    const config = JSON.parse(formData.get("theme") as string) as Record<string, string>;
    const id = formData.get("id") as string | null;
    const targetId = intent === "save" && id
      ? (await updateThemeConfig(admin, id, config), id)
      : await createThemeConfig(admin, config);
    await setActiveThemeId(admin, targetId);
    return Response.json({ ok: true, id: targetId });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};

export default function StyleConfiguration() {
  const { entries, activeId } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ ok: boolean; error?: string; id?: string }>();
  const extractFetcher = useFetcher<{ ok: boolean; error?: string; theme?: Record<ThemeKey, string> }>();

  const [selectedId, setSelectedId] = useState<string | null>(activeId ?? entries[0]?.id ?? null);
  const [isCreating, setIsCreating] = useState(false);
  const selectedEntry = entries.find(e => e.id === selectedId) ?? null;
  const saved = useMemo(() => selectedEntry?.theme ?? {}, [selectedEntry]);

  const [theme, setTheme] = useState<Record<ThemeKey, string>>({ ...EMPTY_THEME, ...saved });
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  /* setta il tema quando: viene selezionata un'altra entry dal menu a tendina, quando si clicca su salva (saved cambia), quaando isCreating termina  */
  useEffect(() => {
    if (isCreating) return;
    setTheme({ ...EMPTY_THEME, ...saved });
  }, [selectedId, saved, isCreating]);

  /* al salvataggio e alla creazione l'entry selezionata diventa quella attiva */
  useEffect(() => {
    if (fetcher.data?.ok && fetcher.data.id) {
      setIsCreating(false);
      setSelectedId(fetcher.data.id);
    }
  }, [fetcher.data]);

  /* applica il tema estratto*/
  useEffect(() => {
    if (extractFetcher.data?.ok && extractFetcher.data.theme) {
      setTheme(t => ({ ...t, ...extractFetcher.data!.theme }));
    }
  }, [extractFetcher.data]);

  /* imposta un valore per una chiave del tema */
  const set = (key: ThemeKey, value: string) => {setTheme(t => ({ ...t, [key]: value }))};

  const isSaving = fetcher.state !== "idle";
  const isExtracting = extractFetcher.state !== "idle";
  const isDirty = ALL_KEYS.some(k => theme[k] !== (saved[k] ?? ""));
  const saveError = fetcher.data?.ok === false ? fetcher.data.error : null;

  const handleSave = () => {
    const toSave = Object.fromEntries(Object.entries(theme).filter(([, v]) => v !== ""));
    const intent = isCreating || !selectedId ? "create" : "save";
    const payload: Record<string, string> = { intent, theme: JSON.stringify(toSave) };
    if (intent === "save" && selectedId) payload.id = selectedId;
    fetcher.submit(payload, { method: "POST" });
  };

  const handleNew = () => {
    setIsCreating(true);
    setSelectedId(null);
    setTheme({ ...EMPTY_THEME });
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

  const handleExtract = () => {
    const formData = new FormData();
    formData.append("intent", "extract");
    formData.append("url", url);
    if (files) Array.from(files).forEach(f => formData.append("files", f));
    extractFetcher.submit(formData, { method: "POST", encType: "multipart/form-data" });
    setFiles(null);
  };

  return (
    <s-page heading="Style configuration">
      <ThemeEntrySelector
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

      {isCreating && (
        <ThemeExtractor
          url={url}
          files={files}
          isExtracting={isExtracting}
          error={extractFetcher.data?.ok === false ? extractFetcher.data.error : null}
          result={extractFetcher.data?.ok ? extractFetcher.data.theme : null}
          onUrlChange={setUrl}
          onFilesChange={setFiles}
          onExtract={handleExtract}
        />
      )}

      <ThemeFieldGrid theme={theme} onChange={set} />

      <s-section>
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
