import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

const THEME_TYPE = "conversational_storefront_theme";

export type ThemeConfig = {
  variant_selector?: Record<string, string>;
};

export async function getThemeConfig(admin: AdminApiContext): Promise<ThemeConfig | null> {
  const res = await admin.graphql(`
    query {
      metaobjects(type: "${THEME_TYPE}", first: 1) {
        nodes {
          theme_config: field(key: "theme_config") { value }
        }
      }
    }
  `);
  const json = await res.json();
  const raw = json.data?.metaobjects?.nodes?.[0]?.theme_config?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ThemeConfig;
  } catch {
    return null;
  }
}

export function buildThemeCss(config: ThemeConfig): string {
  const vars = config.variant_selector ?? {};
  const declarations = Object.entries(vars)
    .filter(([, v]) => v !== "")
    .map(([key, value]) => `  --${key}: ${value};`)
    .join("\n");
  if (!declarations) return "";
  return `:root {\n${declarations}\n}`;
}
