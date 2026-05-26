import { ProductCard } from './index';
import { Product } from '../models/types';

export function ProductList({ products }: { products: Product[] }) {
  return (
    <>
      {products.map((p) => (
        <ProductCard key={p.id} {...p} />
      ))}
    </>
  );
}
