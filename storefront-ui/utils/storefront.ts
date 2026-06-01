export function variantUrl(productUrl: string, variantGid: string): string {
    const numericId = variantGid.split("/").pop();
    return `${productUrl}?variant=${numericId}`;
}

export function getCartId(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)cart=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : null
}


export function setCartId(cartId: string): void {
    document.cookie = `cart=${encodeURIComponent(cartId)}; path=/; max-age=${60 * 60 * 24 * 30}`
}