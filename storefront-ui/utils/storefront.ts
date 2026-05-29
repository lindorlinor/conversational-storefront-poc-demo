export function variantUrl(productUrl: string, variantGid: string): string {
    const numericId = variantGid.split("/").pop();
    return `${productUrl}?variant=${numericId}`;
}

export function getCartId(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)cart=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : null
}
