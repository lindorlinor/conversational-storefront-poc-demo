import { fetchCart, cartLinesAdd } from '../../shopify/utils'

const TEST_VARIANT_ID = 'gid://shopify/ProductVariant/61828386455922'

export async function addToCartExecute({ rawCartId }: { rawCartId: string }) {
    const cart = await fetchCart(rawCartId)
    
    if (!cart) {
        return { error: 'Carrello non trovato' }
    }

    const updatedCart = await cartLinesAdd(rawCartId, TEST_VARIANT_ID, 1)
    return { cart: updatedCart }
}