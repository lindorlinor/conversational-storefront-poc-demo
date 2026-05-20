import { z } from 'zod';
import type { TamboTool } from '@tambo-ai/react';
import { searchProductSchema } from './searchProductSchema';
import { fetchProducts } from '../utils';

const searchProductOutputSchema = z.object({
  products: z.array(z.object({
    id: z.string(),
    handle: z.string(),
    title: z.string(),
    url: z.string(),
    imgUrl: z.string(),
    priceRange: z.object({
      minVariantPrice: z.object({ amount: z.string(), currencyCode: z.string() }),
    }),
    variants: z.array(z.object({
      id: z.string(),
      title: z.string(),
      price: z.object({ amount: z.string() }),
      image: z.object({ url: z.string() }).optional(),
      url: z.string(),
    })).optional(),
  })),
  pagination: z.object({
    hasNextPage: z.boolean(),
    cursor: z.string().nullable(),
  }),
});

export function createSearchProductTool(shop: string, appUrl: string): TamboTool {
  return {
    name: "searchProducts",
    description: `Search for products in the store.
    Use this tool when the user wants to find, browse, or filter products.
    IMPORTANT: Only include filters the user explicitly mentioned. Do NOT guess filter values.`,
    inputSchema: searchProductSchema,
    outputSchema: searchProductOutputSchema,
    tool: (args: z.infer<typeof searchProductSchema>) => fetchProducts(appUrl, shop, args),
  };
}
