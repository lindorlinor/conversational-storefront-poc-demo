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
  ) {
    search(
      query: $query
      first: $first
      after: $after
      productFilters: $filters
      types: [PRODUCT]
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
 async function searchProductExecute(args: SearchProductArgs) {
  console.log('[searchProductTool] called with args:', JSON.stringify(args))
  const { filters, metafield_filters, limit = 10 } = args

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
          query: args.query ?? '*',
          first: limit,
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

  const search = data.data.search

  return {
    products: search.nodes.map((p: {
      id: string; handle: string; title: string;
      url: string | null;
      featuredImage?: { url: string } | null;
      priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
      variants?: { nodes: Array<{ id: string; title: string; price: { amount: string }; image?: { url: string } | null }> };
    }) => {
      const productUrl = p.url ?? `/products/${p.handle}`;
      return {
        id: p.id,
        handle: p.handle,
        title: p.title,
        url: productUrl,
        imgUrl: p.featuredImage?.url ?? '',
        priceRange: p.priceRange,
        variants: p.variants?.nodes?.map(v => ({
          id: v.id,
          title: v.title,
          price: v.price,
          image: v.image ?? undefined,
          url: `${productUrl}?variant=${v.id.split('/').pop()}`,
        })),
      };
    }),
    pagination: {
      hasNextPage: search.pageInfo.hasNextPage,
      cursor: search.pageInfo.endCursor,
    },
  }
}

export default searchProductExecute
