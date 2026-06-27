const STOREFRONT_API_VERSION = '2026-04'


export function storefrontFetch(query: string, variables: Record<string, unknown>) {
  const shop = process.env.SHOPIFY_SHOP
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  if (!shop || !token) {
    throw new Error('SHOPIFY_SHOP o SHOPIFY_STOREFRONT_ACCESS_TOKEN mancanti nell\'env')
  }
  return fetch(`https://${shop}.myshopify.com/api/${STOREFRONT_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Shopify-Storefront-Private-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  }).then(r => r.json())
}
