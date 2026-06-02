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
              quantityAvailable
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
  const { filters, metafield_filters, variant_option_filters, category_filters, taxonomy_filters, limit = 10, sortKey, reverse } = args

  const shop = process.env.SHOPIFY_SHOP
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  // console.log('[searchProductTool] shop:', shop, '| token present:', !!token)

  const productFilters: Record<string, unknown>[] = []

  if (filters?.availability != null) {
    productFilters.push({ available: filters.availability })
  }
  const priceRange = filters?.priceRange
  if (priceRange != null) {
    const { min, max } = priceRange
    if (min != null || max != null) {
      productFilters.push({
        price: {
          min: min ?? undefined,
          max: max ?? undefined,
        },
      })
    }
  }
  if (filters?.categories != null) {
    for (const cat of filters.categories) {
      productFilters.push({ productType: cat })
    }
  }
  if (metafield_filters) {
    for (const mf of metafield_filters) {
      productFilters.push({ productMetafield: mf })
    }
  }
  if (variant_option_filters) {
    for (const vf of variant_option_filters) {
        productFilters.push({ variantOption: { name: vf.name, value: vf.value } })
    }
  }
  if (category_filters) {
    for (const cf of category_filters) {
      productFilters.push({ category: { id: cf.id } })
    }
  }
  if (taxonomy_filters) {
    for (const tf of taxonomy_filters) {
      productFilters.push({ taxonomyMetafield: { namespace: 'shopify', key: tf.key, value: tf.value } })
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

  const availabilityFilter = filters?.availability

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = search.nodes.map((node: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rawVariants: { id: string; title: string; quantityAvailable: number }[] = node.variants?.nodes ?? []

    if (availabilityFilter === true) {
      rawVariants = rawVariants.filter(v => v.quantityAvailable > 0)
    } else if (availabilityFilter === false) {
      // quantityAvailable === -1 significa stock illimitato (es. gift card), quindi lo escludo dal "non disponibile"
      rawVariants = rawVariants.filter(v => v.quantityAvailable === 0)
    }

    const hasRealVariants = !(rawVariants.length === 1 && rawVariants[0].title === 'Default Title')
    return {
      ...node,
      imgUrl: node.featuredImage?.url ?? null,
      images: node.images?.nodes ?? [],
      price: node.priceRange?.minVariantPrice ?? null,
      variants: hasRealVariants ? rawVariants : [],
      defaultVariantId: !hasRealVariants ? rawVariants[0]?.id : undefined,
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
