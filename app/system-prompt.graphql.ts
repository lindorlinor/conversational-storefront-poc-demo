import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

const SYSTEM_PROMPT_TYPE = "$app:system_prompt";
const SYSTEM_PROMPT_HANDLE = "config";

export async function getSystemPrompt(admin: AdminApiContext): Promise<string> {
  const res = await admin.graphql(`
    query {
      metaobjects(type: "${SYSTEM_PROMPT_TYPE}", first: 5) {
        nodes {
          handle
          content: field(key: "content") { value }
        }
      }
    }
  `);
  const json = await res.json();
  return json.data?.metaobjects?.nodes?.[0]?.content?.value ?? "";
}

export async function saveSystemPrompt(admin: AdminApiContext, content: string): Promise<void> {
  const res = await admin.graphql(
    `#graphql
    mutation upsertSystemPrompt($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }`,
    {
      variables: {
        handle: { type: SYSTEM_PROMPT_TYPE, handle: SYSTEM_PROMPT_HANDLE },
        metaobject: {
          fields: [{ key: "content", value: content }],
        },
      },
    },
  );
  const { data } = await res.json();
  const errors = data?.metaobjectUpsert?.userErrors;
  if (errors?.length) throw new Error(errors.map((e: { message: string }) => e.message).join(", "));
}
