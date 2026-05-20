import { Product } from "../models/types";
import ProductCard from "./ProductCard";

export function ProductList({ products }: { products?: Product[] }) {
  if (!products?.length) return null;
  return (
    <div className="flex flex-wrap gap-4 p-2">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
