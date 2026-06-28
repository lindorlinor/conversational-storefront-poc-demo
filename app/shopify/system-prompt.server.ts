import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { LIST_PROMPTS_QUERY, ACTIVE_PROMPT_QUERY, CREATE_PROMPT_MUTATION, UPDATE_PROMPT_MUTATION } from "./system-prompt.graphql";
import { getShopId } from "./shop.server";
import { SET_SHOP_METAFIELD_MUTATION } from "./shop.graphql";

const PROMPT_TYPE = process.env.SYSTEM_PROMPT_METAOBJECT_TYPE;
if (!PROMPT_TYPE) throw new Error("SYSTEM_PROMPT_METAOBJECT_TYPE non è configurato (env)");

const ACTIVE_POINTER_NAMESPACE = process.env.SYSTEM_PROMPT_ACTIVE_POINTER_NAMESPACE ?? "";
const ACTIVE_POINTER_KEY = process.env.SYSTEM_PROMPT_ACTIVE_POINTER_KEY ?? "";

const pointerConfigured = Boolean(ACTIVE_POINTER_NAMESPACE && ACTIVE_POINTER_KEY);

export type PromptEntry = { id: string; handle: string; updatedAt: string; content: string };

type PromptNode = { id: string; handle: string; updatedAt: string; content?: { value: string } };

export async function listSystemPrompts(admin: AdminApiContext): Promise<PromptEntry[]> {
  const res = await admin.graphql(LIST_PROMPTS_QUERY, { variables: { type: PROMPT_TYPE } });
  const json = await res.json();
  const nodes: PromptNode[] = json.data?.metaobjects?.nodes ?? [];
  return nodes.map(nodeToEntry);
}

export async function getActivePromptId(admin: AdminApiContext): Promise<string | null> {
  if (!pointerConfigured) return null;
  const res = await admin.graphql(ACTIVE_PROMPT_QUERY, {
    variables: { namespace: ACTIVE_POINTER_NAMESPACE, key: ACTIVE_POINTER_KEY },
  });
  const json = await res.json();
  return json.data?.shop?.metafield?.value ?? null;
}

export async function setActivePromptId(admin: AdminApiContext, id: string): Promise<void> {
  if (!pointerConfigured) return;
  const res = await admin.graphql(SET_SHOP_METAFIELD_MUTATION, {
    variables: {
      metafields: [{
        ownerId: await getShopId(admin),
        namespace: ACTIVE_POINTER_NAMESPACE,
        key: ACTIVE_POINTER_KEY,
        type: "single_line_text_field",
        value: id,
      }],
    },
  });
  const json = await res.json() as { errors?: { message: string }[]; data?: { metafieldsSet?: { userErrors?: { message: string }[] } } };
  throwOnErrors(json.errors, json.data?.metafieldsSet?.userErrors);
}

export async function getSystemPrompt(admin: AdminApiContext): Promise<string> {
  const entries = await listSystemPrompts(admin);
  if (entries.length === 0) return "";

  const activeId = await getActivePromptId(admin);
  const active = (activeId && entries.find(e => e.id === activeId)) || mostRecentlyUpdated(entries);

  return active.content;
}

export async function createSystemPrompt(admin: AdminApiContext, content: string): Promise<string> {
  const res = await admin.graphql(CREATE_PROMPT_MUTATION, {
    variables: {
      metaobject: {
        type: PROMPT_TYPE,
        handle: `prompt-${Date.now()}`,
        fields: [{ key: "content", value: content }],
      },
    },
  });
  const json = await res.json() as { errors?: { message: string }[]; data?: { metaobjectCreate?: { metaobject?: { id: string }; userErrors?: { message: string }[] } } };
  throwOnErrors(json.errors, json.data?.metaobjectCreate?.userErrors);
  const id = json.data?.metaobjectCreate?.metaobject?.id;
  if (!id) throw new Error("metaobjectCreate non ha restituito un id");
  return id;
}

export async function updateSystemPrompt(admin: AdminApiContext, id: string, content: string): Promise<void> {
  const res = await admin.graphql(UPDATE_PROMPT_MUTATION, {
    variables: {
      id,
      metaobject: {
        fields: [{ key: "content", value: content }],
      },
    },
  });
  const json = await res.json() as { errors?: { message: string }[]; data?: { metaobjectUpdate?: { userErrors?: { message: string }[] } } };
  throwOnErrors(json.errors, json.data?.metaobjectUpdate?.userErrors);
}


function mostRecentlyUpdated<T extends { updatedAt: string }>(items: T[]): T {
  return items.reduce((latest, n) =>
    new Date(n.updatedAt) > new Date(latest.updatedAt) ? n : latest
  );
}

function nodeToEntry(node: PromptNode): PromptEntry {
  return { id: node.id, handle: node.handle, updatedAt: node.updatedAt, content: node.content?.value ?? "" };
}

function throwOnErrors(topLevel?: { message: string }[], userErrors?: { message: string }[]): void {
  if (topLevel?.length) throw new Error(topLevel.map(e => e.message).join(", "));
  if (userErrors?.length) throw new Error(userErrors.map(e => e.message).join(", "));
}
