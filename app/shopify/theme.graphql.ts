import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

const THEME_TYPE = "conversational_storefront_theme";

function mostRecentlyUpdated<T extends { updatedAt: string }>(items: T[]): T {
  return items.reduce((latest, n) =>
    new Date(n.updatedAt) > new Date(latest.updatedAt) ? n : latest
  );
}

export type ThemeConfig = Record<string, string>;

export async function getThemeConfig(admin: AdminApiContext): Promise<{ id: string; theme: ThemeConfig } | null> {
  const res = await admin.graphql(`
    query {
      metaobjects(type: "${THEME_TYPE}", first: 10, query: "status:active") {
        nodes {
          id
          updatedAt
          theme_config: field(key: "theme_config") { value }
        }
      }
    }
  `);
  const json = await res.json();
  const nodes: { id: string; updatedAt: string; theme_config?: { value: string } }[] = json.data?.metaobjects?.nodes ?? [];
  if (nodes.length === 0) return null;

  // se ci sono piu metaobject prende il piu recente (così viene mantenuto uno storico delle modifiche, che ha piu senso di sovrascrivere come ho fatto nel system prompt) todo da modificare in futuro ora non ho voglia
  const node = mostRecentlyUpdated(nodes);

  let theme: ThemeConfig = {};
  if (node.theme_config?.value) {
    try { theme = JSON.parse(node.theme_config.value) as ThemeConfig; } catch { /* theme rimane {} */ }
  }
  return { id: node.id, theme };
}

// crea una nuova entry nel metaobject
export async function createThemeConfig(admin: AdminApiContext, config: ThemeConfig): Promise<void> {
  const res = await admin.graphql(
    `#graphql
    mutation createTheme($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }`,
    {
      variables: {
        metaobject: {
          type: THEME_TYPE,
          handle: `theme-${Date.now()}`,
          fields: [{ key: "theme_config", value: JSON.stringify(config) }],
          capabilities: { publishable: { status: "ACTIVE" } },
        },
      },
    },
  );
  const json = await res.json() as { errors?: { message: string }[]; data?: { metaobjectCreate?: { userErrors?: { message: string }[] } } };
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join(", "));
  const errors = json.data?.metaobjectCreate?.userErrors;
  if (errors?.length) throw new Error(errors.map((e: { message: string }) => e.message).join(", "));
}

export function buildThemeCss(config: ThemeConfig): string {
  const declarations = Object.entries(config ?? {})
    .filter(([, v]) => v !== "")
    .map(([key, value]) => `  --tw-${key}: ${value};`)
    .join("\n");
  if (!declarations) return "";
  return `:root {\n${declarations}\n}`;
}
