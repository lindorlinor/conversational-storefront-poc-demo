import { fetchCart, cartLinesAdd, createCart } from '../../../storefront-ui/utils/utils'

export async function addToCartExecute({ rawCartId, variantId, quantity = 1 }: { rawCartId: string | null, variantId: string, quantity?: number }) {
    if (!rawCartId) {
        const newCart = await createCart(variantId, quantity)
        if (!newCart) return { error: 'Impossibile creare il carrello' }
        const newCartId = newCart.id.replace('gid://shopify/Cart/', '')
        return { cart: newCart, newCartId }
    }

    const cart = await fetchCart(rawCartId)
    if (!cart) return { error: 'Carrello non trovato o scaduto' }

    const updatedCart = await cartLinesAdd(rawCartId, variantId, quantity)
    if (!updatedCart) return { error: 'Impossibile aggiungere al carrello' }

    return { cart: updatedCart }
}