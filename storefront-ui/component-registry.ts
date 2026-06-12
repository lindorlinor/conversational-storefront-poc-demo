/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";

// componente passato dal merchant via init({ components }). Lo schema è un
// JSON Schema (è ciò che il merchant fornisce): viaggia inalterato verso il
// backend del widget, che ci costruisce il tool LLM
export interface MerchantComponent {
  component: ComponentType<any>;
  schema: Record<string, unknown>;
  description: string;
}

// schema serializzabile spedito al backend per generare il tool LLM
export interface SerializedComponentSchema {
  jsonSchema: unknown;
  description: string;
}

// registro runtime popolato da init: nome -> componente del merchant
const merchantComponents: Record<string, MerchantComponent> = {};

export function registerComponents(
  components?: Record<string, MerchantComponent>,
) {
  if (!components) return;
  for (const [name, def] of Object.entries(components)) {
    merchantComponents[name] = def;
  }
}

// componente del merchant per quel nome (lookup nel render loop); undefined
// se il merchant non ha registrato nulla per quel nome -> si usa il default
export function getComponent(name: string): ComponentType<any> | undefined {
  return merchantComponents[name]?.component;
}

// schemi dei componenti merchant da includere nel body di ogni richiesta chat:
// il JSON Schema vive nel frontend ma il tool va costruito nel backend
export function getComponentSchemas(): Record<string, SerializedComponentSchema> {
  return Object.fromEntries(
    Object.entries(merchantComponents).map(([name, def]) => [
      name,
      { jsonSchema: def.schema, description: def.description },
    ]),
  );
}
