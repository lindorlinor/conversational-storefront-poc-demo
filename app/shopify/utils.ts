import { CART_QUERY, CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION } from "./cart.graphql";

const STOREFRONT_API_VERSION = '2025-01'

function storefrontFetch(shop: string, token: string, query: string, variables: Record<string, unknown>) {
    return fetch(`https://${shop}.myshopify.com/api/${STOREFRONT_API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Shopify-Storefront-Private-Token': token,
        },
        body: JSON.stringify({ query, variables }),
    }).then(r => r.json());
}

export async function fetchCart(rawCartId: string) {
    const shop = process.env.SHOPIFY_SHOP!
    const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!
    const cartId = `gid://shopify/Cart/${rawCartId}`
    console.log('[fetchCart] rawCartId ricevuto:', rawCartId)
    console.log('[fetchCart] cartId GID costruito:', cartId)
    const data = await storefrontFetch(shop, token, CART_QUERY, { cartId })
    console.log('[fetchCart] risposta API:', JSON.stringify(data))
    return data.data.cart;
}


export async function createCart(variantId: string, quantity: number = 1) {
    const shop = process.env.SHOPIFY_SHOP!
    const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!
    const data = await storefrontFetch(shop, token, CART_CREATE_MUTATION, {
        lines: [{ merchandiseId: variantId, quantity }],
    })
    console.log('[createCart] risposta API:', JSON.stringify(data))
    return data.data.cartCreate?.cart ?? null
}

export async function cartLinesAdd(cartId: string, variantId: string, quantity: number = 1) {
    const shop = process.env.SHOPIFY_SHOP!
    const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!
    const data = await storefrontFetch(shop, token, CART_LINES_ADD_MUTATION, {
        cartId: `gid://shopify/Cart/${cartId}`,
        lines: [{ merchandiseId: variantId, quantity }],
    })
    console.log('[cartLinesAdd] variantId:', variantId)
    console.log('[cartLinesAdd] risposta API:', JSON.stringify(data))
    return data.data.cartLinesAdd?.cart ?? null
}