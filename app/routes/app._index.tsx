import { useState, useEffect, useRef } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  // TODO: leggere il system prompt dal metaobject via admin.graphql(...)
  const content = "";
  return { shop: session.shop, content };
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
    // TODO: salvare il system prompt nel metaobject via fetch/action
    console.log("save:", shop, value);
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
