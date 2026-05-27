import { tool } from 'ai'
import { z } from 'zod'

export const fetchCollectionSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().describe(
    'Number of collections to return. Defaults to 100.'
  ),
})

export const fetchCollectionDefinition = tool({
  description: `Fetch the list of collections available in the store.
    Use this tool when the user wants to browse categories, departments, or collections.
    Returns each collection's id, handle, title, description, and image.`,
  inputSchema: fetchCollectionSchema,
})
