import { useState, useEffect, useRef } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import db from "../db.server";

// aggiunto perchè app bridge stava patchando il fetch. la promise non risolveva mai perchè aspettava un token da admin che non arrivava
function xhrPost(url: string, body: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = () => reject(new Error("XHR error"));
    xhr.send(JSON.stringify(body));
  });
}


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const record = await db.systemPrompt.findUnique({ where: { shop: session.shop } });
  return { shop: session.shop, content: record?.content ?? "" };
};


export default function Index() {
  const { shop, content } = useLoaderData<typeof loader>();
  const [prompt, setPrompt] = useState(content);
  const textFieldRef = useRef<HTMLElementTagNameMap["s-text-field"]>(null);

  useEffect(() => {
    setPrompt(content);
  }, [content]);

  const handleSave = () => {
    const value = textFieldRef.current?.value ?? "";
    xhrPost("/api/system-prompt", { shop, content: value }).catch(console.error);
  };

  return (
    <s-page heading="Conversational Storefront">
      <s-section>
        <s-text-field
          ref={textFieldRef}
          label="System prompt"
          value={prompt}
        />
        <button onClick={handleSave} type="button">Salva</button>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
