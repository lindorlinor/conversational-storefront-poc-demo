import type { z } from 'zod'
import { searchProductSchema } from './definition'

type SearchProductArgs = z.infer<typeof searchProductSchema>

const STOREFRONT_API_VERSION = '2025-01'
const GRAPHQL_QUERY = `
  query SearchProducts(
    $query: String!
    $first: Int!
    $after: String
    $filters: [ProductFilter!]
    $sortKey: SearchSortKeys = RELEVANCE
    $reverse: Boolean = false
  ) {
    search(
      query: $query
      first: $first
      after: $after
      productFilters: $filters
      types: [PRODUCT]
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ... on Product {
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
          images(first: 10) {
            nodes { url altText }
          }
          variants(first: 10) {
            nodes {
              id
              title
              price { amount }
              image { url }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export async function searchProductExecute(args: SearchProductArgs) {
  console.log('[searchProductTool] called with args:', JSON.stringify(args))
  const t1 = Date.now()
  console.log(`\n⏱ [1] searchProductTool: EXECUTE START`)
  const { filters, metafield_filters, limit = 10, sortKey, reverse } = args

  const shop = process.env.SHOPIFY_SHOP
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  // console.log('[searchProductTool] shop:', shop, '| token present:', !!token)

  const productFilters: Record<string, unknown>[] = []

  if (filters?.availability === true) {
    productFilters.push({ available: true })
  }
  const { min, max } = filters?.priceRange ?? {}
  if (min || max) {
    productFilters.push({
      price: {
        min,
        max,
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
          query: args.query ?? '*',
          first: limit,
          filters: productFilters.length > 0 ? productFilters : undefined,
          sortKey: sortKey ?? 'RELEVANCE',
          reverse: reverse ?? false,
        },
      }),
    },
  )

  const data = await response.json()
  // console.log('[searchProductTool] response status:', response.status, '| data:', JSON.stringify(data).slice(0, 300))

  if (data.errors) {
    console.error('[searchProductTool] GraphQL errors:', data.errors)
    throw new Error(data.errors[0].message)
  }

  const search = data.data.search

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = search.nodes.map((node: any) => {
    const rawVariants: { title: string }[] = node.variants?.nodes ?? []
    const hasRealVariants = !(rawVariants.length === 1 && rawVariants[0].title === 'Default Title')
    return {
      ...node,
      imgUrl: node.featuredImage?.url ?? null,
      images: node.images?.nodes ?? [],
      price: node.priceRange?.minVariantPrice ?? null,
      variants: hasRealVariants ? rawVariants : [],
    }
  })

  console.log(`⏱ [2] searchProductTool: EXECUTE END — ${Date.now() - t1}ms (Shopify API)`)
  return {
    products,
    pagination: {
      hasNextPage: search.pageInfo.hasNextPage,
      cursor: search.pageInfo.endCursor,
    },
  }
}
