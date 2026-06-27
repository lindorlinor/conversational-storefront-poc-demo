import type { z } from 'zod'
import { fetchCollectionSchema } from './definition'
import { storefrontFetch } from '../../shopify/storefront.server'

type FetchCollectionArgs = z.infer<typeof fetchCollectionSchema>

const GRAPHQL_QUERY = `
  query FetchCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`

export async function fetchCollectionExecute(args: FetchCollectionArgs) {
  console.log('[fetchCollectionTool] called with args:', JSON.stringify(args))
  const t1 = Date.now()
  console.log(`\n⏱ [1] fetchCollectionTool: EXECUTE START`)

  const { limit = 100 } = args

  const data = await storefrontFetch(GRAPHQL_QUERY, { first: limit })

  if (data.errors) {
    console.error('[fetchCollectionTool] GraphQL errors:', data.errors)
    throw new Error(data.errors[0].message)
  }

  const collections = data.data.collections

  console.log(`⏱ [2] fetchCollectionTool: EXECUTE END — ${Date.now() - t1}ms (Shopify API)`)
  return {
    collections: collections.nodes,
    hasNextPage: collections.pageInfo.hasNextPage,
  }
}
