import type { z } from 'zod'
import { searchProductInCollectionSchema } from './definition-in-collection'

type SearchProductInCollectionArgs = z.infer<typeof searchProductInCollectionSchema>

const STOREFRONT_API_VERSION = '2025-01'

const GRAPHQL_QUERY = `
  query SearchProductsInCollection(
    $handle: String!
    $first: Int!
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys = COLLECTION_DEFAULT
    $reverse: Boolean = false
  ) {
    collection(handle: $handle) {
      products(
        first: $first
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        nodes {
          id
          title
          handle
          description
          url: onlineStoreUrl
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          featuredImage { url altText }
          variants(first: 10) {
            nodes {
              id
              title
              price { amount }
              image { url }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

export async function searchProductInCollectionExecute(args: SearchProductInCollectionArgs) {
  console.log('[searchProductInCollectionTool] called with args:', JSON.stringify(args))
  const t1 = Date.now()
  console.log(`\n⏱ [1] searchProductInCollectionTool: EXECUTE START`)

  const { collectionHandle, filters, limit = 10, sortKey, reverse } = args

  const shop = process.env.SHOPIFY_SHOP
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

  const productFilters: Record<string, unknown>[] = []

  // availability: ignora false (default del modello), applica solo se true
  if (filters?.availability === true) {
    productFilters.push({ available: true })
  }
  // priceRange: ignora se entrambi sono 0 (default del modello)
  const { min, max } = filters?.priceRange ?? {}
  if (min || max) {
    productFilters.push({ price: { min, max } })
  }

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
        variables: {
          handle: collectionHandle,
          first: limit,
          filters: productFilters.length > 0 ? productFilters : undefined,
          sortKey: sortKey ?? 'COLLECTION_DEFAULT',
          reverse: reverse ?? false,
        },
      }),
    },
  )

  const data = await response.json()

  if (data.errors) {
    console.error('[searchProductInCollectionTool] GraphQL errors:', data.errors)
    throw new Error(data.errors[0].message)
  }

  const collection = data.data.collection
  if (!collection) {
    throw new Error(`Collection "${collectionHandle}" not found`)
  }

  console.log(`⏱ [2] searchProductInCollectionTool: EXECUTE END — ${Date.now() - t1}ms (Shopify API)`)
  return {
    products: collection.products.nodes,
    pagination: {
      hasNextPage: collection.products.pageInfo.hasNextPage,
      cursor: collection.products.pageInfo.endCursor,
    },
  }
}
