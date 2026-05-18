import { useState, useEffect, useRef } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getSystemPrompt } from "../system-prompt.graphql";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const content = await getSystemPrompt(admin);
  return { shop: session.shop, content };
};

export default function Index() {
  const { shop, content } = useLoaderData<typeof loader>();
  const textFieldRef = useRef<HTMLElementTagNameMap["s-text-field"]>(null);
  const [prompt, setPrompt] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPrompt(content);
  }, [content]);

  const handleSave = () => {
    const value = textFieldRef.current?.value ?? "";
    const formData = new FormData();
    formData.append("shop", shop);
    formData.append("content", value);
    setIsSaving(true);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/system-prompt");
    xhr.onload = () => setIsSaving(false);
    xhr.onerror = () => setIsSaving(false);
    xhr.send(formData);
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
