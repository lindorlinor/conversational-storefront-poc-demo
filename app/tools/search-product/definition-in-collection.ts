import { tool } from 'ai'
import { z } from 'zod'

export const searchProductInCollectionSchema = z.object({
  collectionHandle: z.string().describe(
    'Handle of the collection to search within. Obtain it from fetchCollectionTool.'
  ),
  query: z.string().optional().describe(
    "Text to search for within the collection. Omit to return all products in the collection."
  ),
  filters: z.object({
    priceRange: z.object({
      min: z.number().optional().describe('ONLY set if the user explicitly mentions a minimum price.'),
      max: z.number().optional().describe('ONLY set if the user explicitly mentions a maximum price.'),
    }).optional(),
    availability: z.boolean().optional().describe(
      'ONLY set if the user explicitly asks for available or unavailable products.'
    ),
  }).optional().describe('Structured filters. Only include fields the user explicitly requested.'),
  limit: z.number().int().min(1).max(100).optional().describe(
    'Number of products to return. Defaults to 10.'
  ),
  sortKey: z.enum(['COLLECTION_DEFAULT', 'BEST_SELLING', 'TITLE', 'PRICE', 'CREATED']).optional().describe(
    'Sort results by this field. Use PRICE when the user asks for cheapest/most expensive. Defaults to COLLECTION_DEFAULT.'
  ),
  reverse: z.boolean().optional().describe(
    'Reverse the sort order. Use true with sortKey PRICE to get most expensive first.'
  ),
})

export const searchProductInCollectionDefinition = tool({
  description: `Search for products within a specific collection.
    Use this when the user wants to browse or filter products inside a named collection or category.
    Requires the collection handle — call fetchCollectionTool first if you don't have it.
    After getting results, always render a CollectionWidget with the products.

    IMPORTANT rules:
    - Only include filters the user explicitly mentioned.
    - Do NOT set priceRange or availability unless the user specifically asks for them.`,
  inputSchema: searchProductInCollectionSchema,
})
