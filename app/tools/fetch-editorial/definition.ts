import { tool } from 'ai'
import { z } from 'zod'

export const fetchEditorialSchema = z.object({
  type: z.string().describe(
    'The metaobject type to fetch (the "name" of the editorial content set), e.g. "banner", "editorial_image", "homepage_hero". Required.'
  ),
  limit: z.number().int().min(1).max(50).optional().describe(
    'Number of metaobject entries to return. Defaults to 10.'
  ),
})

export const fetchEditorialDefinition = tool({
  description: `Fetch editorial / marketing content stored as Shopify metaobjects, by their type name.
    Use this when the user asks for editorial images, banners, lookbooks or curated visual content
    that is NOT a product or collection.
    Each entry returns its handle, displayName and fields. File reference fields (images) are
    resolved to a usable image URL.
    After fetching, you can render a gallery widget with the resulting images.`,
  inputSchema: fetchEditorialSchema,
})
