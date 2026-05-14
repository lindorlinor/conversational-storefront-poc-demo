import type { z } from 'zod'
import { searchProductSchema } from './definition'

type SearchProductArgs = z.infer<typeof searchProductSchema>

const STOREFRONT_API_VERSION = '2025-01'
const COLLECTION_HANDLE = 'automated-collection'

const GRAPHQL_QUERY = `
  query SearchProducts(
    $handle: String!
    $first: Int!
    $after: String
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      products(
        first: $first
        after: $after
        filters: $filters
      ) {
        nodes {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          featuredImage { url altText }
          availableForSale
          productType
          vendor
          tags
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

export async function searchProductExecute(args: SearchProductArgs) {
  console.log('[searchProductTool] called with args:', JSON.stringify(args))
  const { filters, metafield_filters } = args

  const shop = process.env.SHOPIFY_SHOP
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  console.log('[searchProductTool] shop:', shop, '| token present:', !!token)

  const productFilters: Record<string, unknown>[] = []

  if (filters?.availability !== undefined) {
    productFilters.push({ available: filters.availability })
  }
  if (filters?.priceRange) {
    productFilters.push({
      price: {
        min: filters.priceRange.min,
        max: filters.priceRange.max,
      },
    })
  }
  if (filters?.categories) {
    for (const cat of filters.categories) {
      productFilters.push({ productType: cat })
    }
  }
  if (metafield_filters) {
    for (const mf of metafield_filters) {
      productFilters.push({ productMetafield: mf })
    }
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
          handle: COLLECTION_HANDLE,
          first: 10,
          filters: productFilters.length > 0 ? productFilters : undefined,
        },
      }),
    },
  )

  const data = await response.json()
  console.log('[searchProductTool] response status:', response.status, '| data:', JSON.stringify(data).slice(0, 300))

  if (data.errors) {
    console.error('[searchProductTool] GraphQL errors:', data.errors)
    throw new Error(data.errors[0].message)
  }

  const products = data.data.collection?.products

  if (!products) {
    throw new Error(`Collection "${COLLECTION_HANDLE}" not found`)
  }

  return {
    products: products.nodes,
    pagination: {
      hasNextPage: products.pageInfo.hasNextPage,
      cursor: products.pageInfo.endCursor,
    },
  }
}
