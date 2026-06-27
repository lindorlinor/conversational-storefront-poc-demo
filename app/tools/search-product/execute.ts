import type { z } from 'zod'
import { searchProductSchema } from './definition'
import { storefrontFetch } from '../../shopify/storefront.server'

type SearchProductArgs = z.infer<typeof searchProductSchema>

const GRAPHQL_QUERY = `
  query SearchProducts(
    $query: String!
    $first: Int!
    $after: String
    $filters: [ProductFilter!]
    $sortKey: SearchSortKeys = RELEVANCE
    $reverse: Boolean = false
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
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


export async function searchProductExecute(args: SearchProductArgs, { country, language }: { country?: string; language?: string } = {}) {
  console.log('[searchProductTool] called with args:', JSON.stringify(args))
  const t1 = Date.now()
  console.log(`\n⏱ [1] searchProductTool: EXECUTE START`)
  const { filters, metafield_filters, variant_option_filters, category_filters, taxonomy_filters, limit = 10, sortKey, reverse } = args

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

  const data = await storefrontFetch(GRAPHQL_QUERY, {
    query: args.query ?? '*',
    first: limit,
    filters: productFilters.length > 0 ? productFilters : undefined,
    sortKey: sortKey ?? 'RELEVANCE',
    reverse: reverse ?? false,
    country: country?.toUpperCase() ?? undefined,
    language: language?.toUpperCase() ?? undefined,
  })
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
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      url: node.url,
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
