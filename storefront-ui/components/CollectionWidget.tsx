import { useState, useEffect, useRef } from "react";
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
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const GAP = 12; // gap-3

    const compute = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--size-widget-card")
        .trim();
      const cardPx = parseFloat(raw) || 216;
      const n = Math.max(1, Math.floor((el.clientWidth + GAP) / (cardPx + GAP)));
      setVisibleCount(n);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const canGoNext = carouselIndex + visibleCount < products.length;
  const canGoPrev = carouselIndex > 0;

  const visibleProducts = products.slice(carouselIndex, carouselIndex + visibleCount);

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
        <div className="flex-1 min-w-0 relative">

          <div ref={containerRef} className="overflow-hidden">
            <div className="flex gap-3">
              {visibleProducts.length > 0 ? (
                visibleProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[var(--size-widget-card)]">
                    <ProductCard {...product} />
                  </div>
                ))
              ) : (
                Array.from({ length: visibleCount }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[var(--size-widget-card)]">
                    <ProductCardSkeleton />
                  </div>
                ))
              )}
            </div>
          </div>

          {canGoPrev && (
            <button
              onClick={() => setCarouselIndex((i) => i - 1)}
              className="absolute left-0 inset-y-0 z-10 flex items-center pl-1 pr-8 cursor-pointer text-widget-text-secondary hover:text-widget-text transition-colors"
              style={{ background: "linear-gradient(to right, var(--color-widget-scroll-fade), transparent)" }}
              aria-label="Prodotti precedenti"
            >
              ←
            </button>
          )}

          <button
            onClick={() => canGoNext && setCarouselIndex((i) => i + 1)}
            disabled={!canGoNext}
            className={`absolute right-0 inset-y-0 z-10 flex items-center pl-8 pr-1 transition-all text-widget-text-secondary hover:text-widget-text ${
              canGoNext ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
            }`}
            style={{ background: "linear-gradient(to left, var(--color-widget-scroll-fade), transparent)" }}
            aria-label="Prodotti successivi"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
