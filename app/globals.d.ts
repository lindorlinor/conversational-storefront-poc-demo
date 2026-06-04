declare module "*.css";

declare module "designlang/api" {
  export function extract(url: string, opts?: Record<string, unknown>): Promise<object>;
  export function render(id: string, design: object): string | object;
  export function renderAll(design: object, opts?: Record<string, unknown>): Record<string, string>;
  export const RENDERERS: Readonly<Record<string, (design: object) => string | object>>;
}
