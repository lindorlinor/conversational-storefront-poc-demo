export function variantUrl(productUrl: string, variantGid: string): string {
    const numericId = variantGid.split("/").pop();
    return `${productUrl}?variant=${numericId}`;
}

declare global { interface Window { __APP_ORIGIN__: string; __SHOP__: string } }

export const searchProducts = async (args: Record<string, unknown>) => {
  const appOrigin = window.__APP_ORIGIN__ ?? '';
  const shop = window.__SHOP__ ?? '';
  console.log('[searchProducts] appOrigin:', appOrigin, '| shop:', shop, '| args:', JSON.stringify(args));
  const res = await fetch(`${appOrigin}/api/products?shop=${shop}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  console.log('[searchProducts] response status:', res.status, res.statusText);
  if (!res.ok) {
    const text = await res.text();
    console.error('[searchProducts] error body:', text);
    throw new Error(`HTTP ${res.status}`);
  }
  return await res.json();
};