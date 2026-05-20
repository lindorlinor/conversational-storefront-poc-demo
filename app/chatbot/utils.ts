export function variantUrl(productUrl: string, variantGid: string): string {
  const numericId = variantGid.split('/').pop();
  return `${productUrl}?variant=${numericId}`;
}

export async function fetchProducts(appUrl: string, shop: string, args: Record<string, unknown>) {
  const res = await fetch(`${appUrl}/api/products?shop=${shop}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
