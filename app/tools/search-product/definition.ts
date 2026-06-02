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
                    min: z.number().nullable().describe(
                        'Minimum price explicitly mentioned by the user. Set to null if not mentioned.'
                    ),
                    max: z.number().nullable().describe(
                        'Maximum price explicitly mentioned by the user. Set to null if not mentioned.'
                    ),
                })
                .nullable()
                .describe('Set to null if the user does not mention a price or budget.'),
            availability: z.boolean().nullable().describe(
                'Set to null if the user does not mention availability. Only set to true/false when the user uses words like "available", "in stock", "out of stock".'
            ),
            categories: z.array(z.string()).optional().describe(
                'Product type categories. Omit entirely if the user does not mention a specific category.'
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
    variant_option_filters: z
    .array(
        z.object({
            name: z.string(),
            value: z.string(),
        }),
    )
    .optional()
    .describe('Filter by variant options. Use when the user asks for products by age, size, color or other variant attributes. E.g. name: "age", value: "3-8 years"'),
    category_filters: z
    .array(
        z.object({
            id: z.string(),
        }),
    )
    .optional()
    .describe('Filter by Shopify taxonomy category ID. Use when the user asks for products belonging to a specific category (e.g. snowboards, boots). Each entry is a CategoryFilter with an id field.'),
    taxonomy_filters: z
    .array(
        z.object({
            key: z.string(),
            value: z.string(),
        }),
    )
    .optional()
    .describe('Filter by Shopify standard taxonomy metafields (namespace is always "shopify"). Keys are standardized by Shopify (e.g. "color-pattern", "size", "material"). Values are Shopify taxonomy GIDs (e.g. "gid://shopify/TaxonomyValue/1").'),
    limit: z.number().int().min(1).max(100).optional().describe(
        'Number of products to return. Use only if the user specifies a quantity (e.g. "show me 3 products"). Defaults to 10.'
    ),
    sortKey: z.enum(['RELEVANCE', 'PRICE', 'TITLE', 'PRODUCT_TYPE']).optional().describe(
        'Sort results by this field. Use PRICE when the user asks for cheapest/most expensive. Defaults to RELEVANCE.'
    ),
    reverse: z.boolean().optional().describe(
        'Reverse the sort order. Use true with sortKey PRICE to get most expensive first, false to get cheapest first.'
    ),
    collectionHandle: z.string().optional().describe(
        'If set, restricts the search to products within this collection handle. Use when the user mentions a specific collection or category name.'
    ),
});


export const searchProductDefinition = tool({
    description: `Search for products in the store.
        Use this tool when the user wants to find, browse, or filter products.
        After obtaining results, you can call a widget tool to display it visually.

        IMPORTANT rules:
        - Only include filters the user explicitly mentioned. Do NOT guess or default filter values.
        - Do NOT set priceRange, availability, or categories unless the user specifically asks for them.
        - If the user just says a product name, only set query and leave all filters unset.`,
    inputSchema: searchProductSchema,
});
