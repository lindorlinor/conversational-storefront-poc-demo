import {tool} from 'ai'
import {z} from 'zod'

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
});


export const searchProductDefinition = tool({
    description: `Search for products in the store.
        Use this tool when the user wants to find, browse, or filter products.
        After obtaining results, call a ProductCard tool once for each product to display it visually.

        IMPORTANT rules:
        - Only include filters the user explicitly mentioned. Do NOT guess or default filter values.
        - Do NOT set priceRange, availability, or categories unless the user specifically asks for them.
        - If the user just says a product name (e.g. "wax"), only set query and leave all filters unset.`,
    inputSchema: searchProductSchema,
});
