export function variantUrl(productUrl: string, variantGid: string): string {
    const numericId = variantGid.split("/").pop();
    return `${productUrl}?variant=${numericId}`;
}