import { ProductCard } from './index';
import { ProductCardSkeleton } from './ProductCard';
import { Product } from '../models/types';

const PLACEHOLDER_COUNT = 3;

export function ProductList({ products }: { products?: Product[] }) {
  if (!products?.length) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex gap-3 flex-nowrap pb-2 w-max">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="flex gap-3 flex-nowrap pb-2 w-max">
        {products.map((p, i) => (
          <ProductCard key={p.id ?? i} {...p} />
        ))}
      </div>
    </div>
  );
}
