import type { z } from 'zod'
import { searchProductInCollectionSchema } from './definition-in-collection'
import { storefrontFetch } from '../../shopify/storefront.server'

type SearchProductInCollectionArgs = z.infer<typeof searchProductInCollectionSchema>

const GRAPHQL_QUERY = `
  query SearchProductsInCollection(
    $handle: String!
    $first: Int!
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys = COLLECTION_DEFAULT
    $reverse: Boolean = false
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
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


export async function searchProductInCollectionExecute(args: SearchProductInCollectionArgs, { country, language }: { country?: string; language?: string } = {}) {
  console.log('[searchProductInCollectionTool] called with args:', JSON.stringify(args))
  const t1 = Date.now()
  console.log(`\n⏱ [1] searchProductInCollectionTool: EXECUTE START`)

  const { collectionHandle, onlyAvailable, limit = 10, sortKey, reverse } = args

  const productFilters: Record<string, unknown>[] = []

  if (onlyAvailable === true) {
    productFilters.push({ available: true })
  }

  const data = await storefrontFetch(GRAPHQL_QUERY, {
    handle: collectionHandle,
    first: limit,
    filters: productFilters.length > 0 ? productFilters : undefined,
    sortKey: sortKey ?? 'COLLECTION_DEFAULT',
    reverse: reverse ?? false,
    country: country?.toUpperCase() ?? undefined,
    language: language?.toUpperCase() ?? undefined,
  })

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
    id: node.id,
    title: node.title,
    handle: node.handle,
    url: node.url,
    imgUrl: node.featuredImage?.url ?? null,
    price: node.priceRange?.minVariantPrice ?? null,
  }))

  return {
    collectionHandle,
    products,
    hasNextPage: collection.products.pageInfo.hasNextPage,
  }
}
