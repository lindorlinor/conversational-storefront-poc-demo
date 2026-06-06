import { useState } from "react";
import type { Product } from "../models/types";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

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
    <div className="flex gap-8 py-8">

      {/* colonna sinistra — testo */}
      <div className="flex-shrink-0 w-[220px] flex flex-col gap-3">
        <h2 className="text-[22px] font-medium m-0 text-gray-900">{title}</h2>
        <p className="text-sm leading-relaxed text-gray-500 m-0">{description}</p>
      </div>

      {/* colonna destra — immagine di copertina + carosello prodotti */}
      <div className="flex-1 flex gap-3 min-w-0">

        {/* immagine copertina */}
        {coverImageUrl && (
          <div className="flex-shrink-0 w-[var(--size-widget-card)] aspect-square rounded-widget-base bg-widget-surface border border-widget-border overflow-hidden">
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

          <div className="flex gap-3">
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[var(--size-widget-card)]">
                  <ProductCard {...product} />
                </div>
              ))
            ) : (
              Array.from({ length: VISIBLE }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[var(--size-widget-card)]">
                  <ProductCardSkeleton />
                </div>
              ))
            )}
          </div>

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

