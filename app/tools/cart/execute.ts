import { fetchCart, cartLinesAdd } from '../../shopify/utils'

export async function addToCartExecute({ rawCartId, variantId, quantity = 1 }: { rawCartId: string | null, variantId: string, quantity?: number }) {
    if (!rawCartId){
        return { error: 'Nessun carrello trovato' }
    }

    const cart = await fetchCart(rawCartId)
    
    if (!cart){
        return { error: 'Carrello non trovato o scaduto' }
    }

    const updatedCart = await cartLinesAdd(rawCartId, variantId, quantity)
    
    return { cart: updatedCart }
}