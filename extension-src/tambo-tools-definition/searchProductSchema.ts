import { z } from 'zod'

export const searchProductSchema = z.object({
  query: z.string().optional().describe(
    "Text to search for in product titles and descriptions. Use the language of the store's products. Omit if searching only by filters."
  ),
  filters: z
    .object({
      priceRange: z
        .object({
          min: z.number().optional().describe('ONLY set if the user explicitly mentions a price, budget, or price range.'),
          max: z.number().optional().describe('ONLY set if the user explicitly mentions a price, budget, or price range.'),
        })
        .optional()
        .describe('ONLY set if the user explicitly mentions a price, budget, or price range.'),
      availability: z.boolean().optional().describe(
        'ONLY set if the user explicitly asks for available (true) or unavailable (false) products. Do NOT include this field otherwise.'
      ),
      categories: z.array(z.string()).optional().describe(
        'Product type categories. ONLY set if the user mentions a specific category. Leave as empty array or omit otherwise.'
      ),
    })
    .optional()
    .describe('Structured filters. Only include fields the user explicitly requested. When in doubt, omit the field entirely.'),
  metafield_filters: z
    .array(
      z.object({
        namespace: z.string(),
        key: z.string(),
        value: z.string(),
      }),
    )
    .optional()
    .describe('Filter by custom product metafields. Use only when the user mentions an attribute that maps to a known metafield.'),
  limit: z.number().int().min(1).max(50).optional().describe(
    'Number of products to return. Use only if the user specifies a quantity (e.g. "show me 3 products"). Defaults to 10.'
  ),
})
