import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { LIST_THEMES_QUERY, ACTIVE_THEME_QUERY, CREATE_THEME_MUTATION, UPDATE_THEME_MUTATION } from "./theme.graphql";
import { getShopId } from "./shop.server";
import { SET_SHOP_METAFIELD_MUTATION } from "./shop.graphql";

const THEME_TYPE = process.env.THEME_METAOBJECT_TYPE;
if (!THEME_TYPE) throw new Error("THEME_METAOBJECT_TYPE non è configurato (env)");

const ACTIVE_POINTER_NAMESPACE = process.env.THEME_ACTIVE_POINTER_NAMESPACE ?? "";
const ACTIVE_POINTER_KEY = process.env.THEME_ACTIVE_POINTER_KEY ?? "";

const pointerConfigured = Boolean(ACTIVE_POINTER_NAMESPACE && ACTIVE_POINTER_KEY);

export type ThemeConfig = Record<string, string>;

export type ThemeEntry = { id: string; handle: string; updatedAt: string; theme: ThemeConfig };

type ThemeNode = { id: string; handle: string; updatedAt: string; theme_config?: { value: string } };

export async function listThemeConfigs(admin: AdminApiContext): Promise<ThemeEntry[]> {
  const res = await admin.graphql(LIST_THEMES_QUERY, { variables: { type: THEME_TYPE } });
  const json = await res.json();
  const nodes: ThemeNode[] = json.data?.metaobjects?.nodes ?? [];
  return nodes.map(nodeToEntry);
}

export async function getActiveThemeId(admin: AdminApiContext): Promise<string | null> {
  if (!pointerConfigured) return null;
  const res = await admin.graphql(ACTIVE_THEME_QUERY, {
    variables: { namespace: ACTIVE_POINTER_NAMESPACE, key: ACTIVE_POINTER_KEY },
  });
  const json = await res.json();
  return json.data?.shop?.metafield?.value ?? null;
}

export async function setActiveThemeId(admin: AdminApiContext, id: string): Promise<void> {
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

export async function getThemeConfig(admin: AdminApiContext): Promise<{ id: string; theme: ThemeConfig } | null> {
  const entries = await listThemeConfigs(admin);
  if (entries.length === 0) return null;

  const activeId = await getActiveThemeId(admin);
  const active = (activeId && entries.find(e => e.id === activeId)) || mostRecentlyUpdated(entries);

  return { id: active.id, theme: active.theme };
}

export async function createThemeConfig(admin: AdminApiContext, config: ThemeConfig): Promise<string> {
  const res = await admin.graphql(CREATE_THEME_MUTATION, {
    variables: {
      metaobject: {
        type: THEME_TYPE,
        handle: `theme-${Date.now()}`,
        fields: [{ key: "theme_config", value: JSON.stringify(config) }],
        capabilities: { publishable: { status: "ACTIVE" } },
      },
    },
  });
  const json = await res.json() as { errors?: { message: string }[]; data?: { metaobjectCreate?: { metaobject?: { id: string }; userErrors?: { message: string }[] } } };
  throwOnErrors(json.errors, json.data?.metaobjectCreate?.userErrors);
  const id = json.data?.metaobjectCreate?.metaobject?.id;
  if (!id) throw new Error("metaobjectCreate non ha restituito un id");
  return id;
}

// aggiorna una entry esistente
export async function updateThemeConfig(admin: AdminApiContext, id: string, config: ThemeConfig): Promise<void> {
  const res = await admin.graphql(UPDATE_THEME_MUTATION, {
    variables: {
      id,
      metaobject: {
        fields: [{ key: "theme_config", value: JSON.stringify(config) }],
      },
    },
  });
  const json = await res.json() as { errors?: { message: string }[]; data?: { metaobjectUpdate?: { userErrors?: { message: string }[] } } };
  throwOnErrors(json.errors, json.data?.metaobjectUpdate?.userErrors);
}

export function buildThemeCss(config: ThemeConfig): string {
  const declarations = Object.entries(config ?? {})
    .filter(([, v]) => v !== "")
    .map(([key, value]) => `  --tw-${key}: ${value};`)
    .join("\n");
  if (!declarations) return "";
  return `:root {\n${declarations}\n}`;
}



function mostRecentlyUpdated<T extends { updatedAt: string }>(items: T[]): T {
  return items.reduce((latest, n) =>
    new Date(n.updatedAt) > new Date(latest.updatedAt) ? n : latest
  );
}

function parseTheme(value: string | null | undefined): ThemeConfig {
  if (!value) return {};
  try { return JSON.parse(value) as ThemeConfig; } catch { return {}; }
}

function nodeToEntry(node: ThemeNode): ThemeEntry {
  return { id: node.id, handle: node.handle, updatedAt: node.updatedAt, theme: parseTheme(node.theme_config?.value) };
}

function throwOnErrors(topLevel?: { message: string }[], userErrors?: { message: string }[]): void {
  if (topLevel?.length) throw new Error(topLevel.map(e => e.message).join(", "));
  if (userErrors?.length) throw new Error(userErrors.map(e => e.message).join(", "));
}
