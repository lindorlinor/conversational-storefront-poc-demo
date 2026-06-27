import { CART_QUERY, CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION } from './cart.graphql';
import { storefrontFetch } from './storefront.server';

export async function fetchCart(rawCartId: string) {
  const cartId = `gid://shopify/Cart/${rawCartId}`
  console.log('[fetchCart] rawCartId ricevuto:', rawCartId)
  const data = await storefrontFetch(CART_QUERY, { cartId })
  console.log('[fetchCart] risposta API:', JSON.stringify(data))
  return data.data.cart
}

export async function createCart(variantId: string, quantity: number = 1) {
  const data = await storefrontFetch(CART_CREATE_MUTATION, {
    lines: [{ merchandiseId: variantId, quantity }],
  })
  console.log('[createCart] risposta API:', JSON.stringify(data))
  return data.data.cartCreate?.cart ?? null
}

export async function cartLinesAdd(cartId: string, variantId: string, quantity: number = 1) {
  const data = await storefrontFetch(CART_LINES_ADD_MUTATION, {
    cartId: `gid://shopify/Cart/${cartId}`,
    lines: [{ merchandiseId: variantId, quantity }],
  })
  console.log('[cartLinesAdd] risposta API:', JSON.stringify(data))
  return data.data.cartLinesAdd?.cart ?? null
}
