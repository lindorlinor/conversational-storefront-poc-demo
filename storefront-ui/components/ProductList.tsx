import { ProductCard } from './index';
import { ProductCardSkeleton } from './ProductCard';
import { Product } from '../models/types';

const PLACEHOLDER_COUNT = 3;

export function ProductList({ products }: { products?: Product[] }) {
  if (!products?.length) {
    return (
      <div className="mx-auto w-[70%] grid grid-cols-3 justify-items-center gap-4">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto w-[70%] grid grid-cols-3 justify-items-center gap-4">
      {products.map((p, i) => (
        <ProductCard key={p.id ?? i} {...p} />
      ))}
    </div>
  );
}
