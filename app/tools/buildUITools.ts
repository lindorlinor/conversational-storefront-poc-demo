import { registry} from "../components-schema/registry";
import { tool } from 'ai';

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

