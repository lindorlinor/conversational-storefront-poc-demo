import { ProductCard } from './index';
import { Product } from '../models/types';

export function ProductList({ products }: { products?: Product[] }) {
  if (!products?.length) return null;
  return (
    <>
      {products.map((p, i) => (
        <ProductCard key={p.id ?? i} {...p} />
      ))}
    </>
  );
}
