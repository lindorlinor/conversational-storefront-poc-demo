import type { z } from 'zod'
import { fetchCollectionSchema } from './definition'

type FetchCollectionArgs = z.infer<typeof fetchCollectionSchema>

const STOREFRONT_API_VERSION = '2025-01'
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

  const shop = process.env.SHOPIFY_SHOP
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

  const response = await fetch(
    `https://${shop}.myshopify.com/api/${STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Shopify-Storefront-Private-Token': token!,
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables: { first: limit },
      }),
    },
  )

  const data = await response.json()

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
