import { z } from 'zod';
import { TamboTool } from '@tambo-ai/react';
import { searchProducts } from '../utils/url';
import { searchProductSchema } from './searchProductSchema';

export { searchProductSchema };

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

export const searchProductTamboTool: TamboTool = {
  name: "searchProducts",
  description: `Search for products in the store.
    Use this tool when the user wants to find, browse, or filter products.

    IMPORTANT rules:
    - Only include filters the user explicitly mentioned. Do NOT guess or default filter values.
    - Do NOT set priceRange, availability, or categories unless the user specifically asks for them.
    - If the user just says a product name (e.g. "wax"), only set query and leave all filters unset.`,
  tool: searchProducts,
  inputSchema: searchProductSchema,
  outputSchema: searchProductOutputSchema,
};
