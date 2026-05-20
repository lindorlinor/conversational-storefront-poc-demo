import { z } from 'zod'

export const searchProductSchema = z.object({
  query: z.string().optional().describe(
    "Text to search for in product titles and descriptions. Omit if searching only by filters."
  ),
  filters: z
    .object({
      priceRange: z
        .object({
          min: z.number().optional().describe('ONLY set if the user explicitly mentions a minimum price.'),
          max: z.number().optional().describe('ONLY set if the user explicitly mentions a maximum price.'),
        })
        .optional(),
      availability: z.boolean().optional().describe(
        'ONLY set if the user explicitly asks for available or unavailable products.'
      ),
      categories: z.array(z.string()).optional().describe(
        'Product type categories. ONLY set if the user mentions a specific category.'
      ),
    })
    .optional(),
  metafield_filters: z
    .array(z.object({ namespace: z.string(), key: z.string(), value: z.string() }))
    .optional()
    .describe('Filter by custom product metafields.'),
  limit: z.number().int().min(1).max(50).optional().describe(
    'Number of products to return. Use only if the user specifies a quantity. Defaults to 10.'
  ),
})
