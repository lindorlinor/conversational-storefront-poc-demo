import type { z } from 'zod'
import { fetchEditorialSchema } from './definition'
import { storefrontFetch } from '../../shopify/storefront.server'

type FetchEditorialArgs = z.infer<typeof fetchEditorialSchema>

const GRAPHQL_QUERY = `
  query FetchEditorial(
    $type: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    metaobjects(type: $type, first: $first) {
      nodes {
        handle
        displayName
        fields {
          key
          value
          type
          reference {
            __typename
            ... on MediaImage {
              image { url altText width height }
            }
            ... on Video {
              previewImage { url altText }
            }
          }
        }
      }
    }
  }
`

export async function fetchEditorialExecute(
  args: FetchEditorialArgs,
  { country, language }: { country?: string; language?: string } = {},
) {
  console.log('[fetchEditorialTool] called with args:', JSON.stringify(args))
  const { type, limit = 10 } = args

  const data = await storefrontFetch(GRAPHQL_QUERY, {
    type,
    first: limit,
    country: country?.toUpperCase() ?? undefined,
    language: language?.toUpperCase() ?? undefined,
  })

  if (data.errors) {
    console.error('[fetchEditorialTool] GraphQL errors:', data.errors)
    throw new Error(data.errors[0].message)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes: any[] = data.data?.metaobjects?.nodes ?? []

  const entries = nodes.map((node) => {
    // appiattiamo i field in un oggetto { key: value }, risolvendo i file_reference
    // in un URL (campo "<key>Url") oltre a tenere il value grezzo.
    const fields: Record<string, unknown> = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const f of node.fields ?? []) {
      fields[f.key] = f.value
      const ref = f.reference
      if (ref) {
        const url = ref.image?.url ?? ref.previewImage?.url ?? null
        if (url) {
          fields[`${f.key}Url`] = url
          fields[`${f.key}Alt`] = ref.image?.altText ?? ref.previewImage?.altText ?? null
        }
      }
    }
    return {
      handle: node.handle,
      displayName: node.displayName,
      fields,
    }
  })

  console.log(`[fetchEditorialTool] ${entries.length} entries for type "${type}"`)
  return { type, entries }
}
