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
          url: onlineStoreUrl
          featuredImage { url altText }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`

export async function searchProductInCollectionExecute(args: SearchProductInCollectionArgs) {
  console.log('[searchProductInCollectionTool] called with args:', JSON.stringify(args))
  const t1 = Date.now()
  console.log(`\n⏱ [1] searchProductInCollectionTool: EXECUTE START`)

  const { collectionHandle, onlyAvailable, limit = 10, sortKey, reverse } = args

  const shop = process.env.SHOPIFY_SHOP
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

  const productFilters: Record<string, unknown>[] = []

  if (onlyAvailable === true) {
    productFilters.push({ available: true })
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = collection.products.nodes.map((node: any) => ({
    ...node,
    imgUrl: node.featuredImage?.url ?? null,
    price: node.priceRange?.minVariantPrice ?? null,
  }))

  return {
    collectionHandle,
    products,
    hasNextPage: collection.products.pageInfo.hasNextPage,
  }
}
