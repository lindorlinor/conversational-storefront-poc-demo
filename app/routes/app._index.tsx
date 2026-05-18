import { useState, useEffect, useRef } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getSystemPrompt } from "../system-prompt.graphql";

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
    fetcher.submit({ content: value }, { method: "POST", action: "/api/system-prompt" });
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
