import { useState } from "react";
import type { Product } from "../models/types";

export interface CollectionSectionProps {
  title: string;
  description: string;
  coverImageUrl?: string;
  products?: Product[];
}

export function CollectionWidget({
  title,
  description,
  coverImageUrl,
  products = [],
}: CollectionSectionProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const VISIBLE = 3;
  const canGoNext = carouselIndex + VISIBLE < products.length;
  const canGoPrev = carouselIndex > 0;

  const visibleProducts = products.slice(carouselIndex, carouselIndex + VISIBLE);

  return (
    <div className="flex gap-8 py-8 border-b border-gray-200">

      {/* colonna sinistra — testo */}
      <div className="flex-shrink-0 w-[220px] flex flex-col gap-3">
        <h2 className="text-[22px] font-medium m-0 text-gray-900">{title}</h2>
        <p className="text-sm leading-relaxed text-gray-500 m-0">{description}</p>
      </div>

      {/* colonna destra — immagine di copertina + carosello prodotti */}
      <div className="flex-1 flex gap-3 min-w-0">

        {/* immagine copertina */}
        {coverImageUrl && (
          <div className="flex-shrink-0 w-[180px] h-[180px] rounded-xl bg-gray-100 border border-gray-200 overflow-hidden">
            <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* carosello prodotti */}
        <div className="flex-1 flex items-center gap-2 min-w-0 relative">

          {/* freccia indietro */}
          {canGoPrev && (
            <button
              onClick={() => setCarouselIndex((i) => i - 1)}
              className="absolute left-0 z-10 w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center cursor-pointer"
              aria-label="Prodotti precedenti"
            >
              <i className="ti ti-arrow-left text-base" aria-hidden="true" />
            </button>
          )}

          <div className="flex-1 grid grid-cols-3 gap-3 min-w-0">
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              Array.from({ length: VISIBLE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            )}
          </div>

          {/* freccia avanti */}
          <button
            onClick={() => canGoNext && setCarouselIndex((i) => i + 1)}
            disabled={!canGoNext}
            className={`flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center transition-opacity ${
              canGoNext ? "opacity-100 cursor-pointer" : "opacity-30 cursor-default"
            }`}
            aria-label="Prodotti successivi"
          >
            <i className="ti ti-arrow-right text-base" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- sub-componenti interni ---

function ProductCard({ product }: { product: Product }) {
  const price = product.priceRange?.minVariantPrice?.amount
    ? `${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)} ${product.priceRange.minVariantPrice.currencyCode ?? ""}`
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
      <div className="h-[120px] bg-gray-100 overflow-hidden">
        {product.imgUrl ? (
          <img src={product.imgUrl} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            no image
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 flex flex-col gap-1.5">
        <p className="text-[13px] font-medium m-0 text-gray-900 truncate">{product.title}</p>
        <div className="flex items-center justify-between">
          {price && <span className="text-[13px] text-gray-500">{price}</span>}
          <button className="text-[11px] px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 border border-gray-200 rounded-xl h-[180px]" />
  );
}
