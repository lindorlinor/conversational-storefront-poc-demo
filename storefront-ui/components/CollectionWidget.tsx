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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateArrows); ro.disconnect(); };
  }, [products]);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--size-widget-card").trim()) || 216;
    el.scrollBy({ left: dir === "right" ? cardPx + 12 : -(cardPx + 12), behavior: "smooth" });
  };

  return (
    <div className="flex gap-8 py-8">

      {/* colonna sinistra — testo */}
      <div className="flex-shrink-0 w-[220px] flex flex-col gap-3">
        <h2 className="text-[22px] font-medium m-0 text-gray-900">{title}</h2>
        <p className="font-widget-secondary text-sm leading-relaxed text-gray-500 m-0">{description}</p>
      </div>

      {/* colonna destra — immagine di copertina + scroll prodotti */}
      <div className="flex-1 flex gap-3 min-w-0">

        {coverImageUrl && (
          <div className="flex-shrink-0 w-[var(--size-widget-card)] aspect-square rounded-widget-base bg-widget-surface border border-widget-border overflow-hidden">
            <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex-1 min-w-0 relative">
          <div
            ref={scrollRef}
            className="overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex gap-3 flex-nowrap">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[var(--size-widget-card)]">
                    <ProductCard {...product} />
                  </div>
                ))
              ) : (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[var(--size-widget-card)]">
                    <ProductCardSkeleton />
                  </div>
                ))
              )}
            </div>
          </div>

          {canLeft && (
            <button
              onClick={() => scrollBy("left")}
              className="absolute left-0 inset-y-0 z-10 flex items-center pl-1 pr-8 cursor-pointer text-widget-text-secondary hover:text-widget-text transition-colors"
              style={{ background: "linear-gradient(to right, var(--color-widget-scroll-fade), transparent)" }}
              aria-label="Prodotti precedenti"
            >←</button>
          )}
          <button
            onClick={() => scrollBy("right")}
            disabled={!canRight}
            className={`absolute right-0 inset-y-0 z-10 flex items-center pl-8 pr-1 transition-all text-widget-text-secondary hover:text-widget-text ${canRight ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"}`}
            style={{ background: "linear-gradient(to left, var(--color-widget-scroll-fade), transparent)" }}
            aria-label="Prodotti successivi"
          >→</button>
        </div>
      </div>
    </div>
  );
}
