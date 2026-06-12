import { registry} from "../components-schema/registry";
import { tool, jsonSchema } from 'ai';

export function getUItools() {
  return Object.fromEntries(
    Object.entries(registry).map(([name, def]) => [
      name,
      tool({
        description: def.description,
        inputSchema: def.schema,
        execute: async () => ({}),
      }),
    ])
  );
}

export function buildMerchantUITools(
  componentSchemas?: Record<string, {jsonSchema: unknown; description: string}>,
) {
  if (!componentSchemas) return {};
  return Object.fromEntries(
    Object.entries(componentSchemas).map(([name, def]) => [
      name,
      tool({
        description: def.description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputSchema: jsonSchema(def.jsonSchema as any),
        execute: async () => ({}),
      }),
    ])
  );
}

