import { useState, useEffect, useRef } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getSystemPrompt, saveSystemPrompt } from "../system-prompt.graphql";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const content = formData.get("content") as string;
  try {
    await saveSystemPrompt(admin, content);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const content = await getSystemPrompt(admin);
  return { content };
};

export default function Index() {
  const { content } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const textFieldRef = useRef<HTMLElementTagNameMap["s-text-field"]>(null);
  const [prompt, setPrompt] = useState(content);

  const isSaving = fetcher.state !== "idle";

  useEffect(() => {
    setPrompt(content);
  }, [content]);

  const handleSave = () => {
    const value = textFieldRef.current?.value ?? "";
    fetcher.submit({ content: value }, { method: "POST" });
  };

  return (
    <s-page heading="Conversational Storefront">
      <s-section>
        <s-text-field
          ref={textFieldRef}
          label="System prompt"
          value={prompt}
        />
        <button onClick={handleSave} type="button" disabled={isSaving}>
          {isSaving ? "Salvataggio..." : "Salva"}
        </button>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
