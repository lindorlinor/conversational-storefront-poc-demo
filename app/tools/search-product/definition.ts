import {tool} from 'ai'
import {z} from 'zod'

export const searchProductSchema =z.object({
        query: z.string().optional(),
        filters: z
            .object({
                priceRange: z
                    .object({
                        min: z.number().optional(),
                        max: z.number().optional(),
                    })
                    .optional(),
                availability: z.boolean().optional(),
                categories: z.array(z.string()).optional(),
            })
            .optional(),
        metafield_filters: z
            .array(
                z.object({
                    namespace: z.string(),
                    key: z.string(),
                    value: z.string(),
                }),
            )
            .optional(),
});


export const searchProductDefinition = tool({
    description: 'Search for products from the store, with support for standard queries and metafield filtering.\n\nUse this tool to find products by:\n- Natural language queries (e.g. "red kettle", "waterproof jacket")\n- Standard filters: price range, availability, categories\n- Metafield values: filter by custom product attributes stored as metafields,\n  specifying namespace, key, and value (e.g. namespace: "custom", key: "material", value: "leather")\n\nAt least one of query, filters, or metafield_filters must be provided.\n\nResults are paginated. Use pagination.cursor from the response to fetch additional pages.',
    inputSchema: searchProductSchema,
});