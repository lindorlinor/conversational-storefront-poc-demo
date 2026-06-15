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
    <div className="tw:flex tw:gap-8 tw:py-8">

      {/* colonna sinistra — testo */}
      <div className="tw:flex-shrink-0 tw:w-[220px] tw:flex tw:flex-col tw:gap-3">
        <h2 className="tw:text-[22px] tw:font-medium tw:m-0 tw:text-gray-900">{title}</h2>
        <p className="tw:font-widget-secondary tw:text-sm tw:leading-relaxed tw:text-gray-500 tw:m-0">{description}</p>
      </div>

      {/* colonna destra — immagine di copertina + scroll prodotti */}
      <div className="tw:flex-1 tw:flex tw:gap-3 tw:min-w-0">

        {coverImageUrl && (
          <div className="tw:flex-shrink-0 tw:w-[var(--size-widget-card)] tw:aspect-square tw:rounded-widget-card tw:bg-widget-surface tw:border tw:border-widget-border tw:overflow-hidden">
            <img src={coverImageUrl} alt={title} className="tw:w-full tw:h-full tw:object-cover" />
          </div>
        )}

        <div className="tw:flex-1 tw:min-w-0 tw:relative">
          <div
            ref={scrollRef}
            className="tw:overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="tw:flex tw:gap-3 tw:flex-nowrap">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="tw:flex-shrink-0 tw:w-[var(--size-widget-card)]">
                    <ProductCard {...product} />
                  </div>
                ))
              ) : (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="tw:flex-shrink-0 tw:w-[var(--size-widget-card)]">
                    <ProductCardSkeleton />
                  </div>
                ))
              )}
            </div>
          </div>

          {canLeft && (
            <button
              onClick={() => scrollBy("left")}
              className="tw:absolute tw:left-0 tw:inset-y-0 tw:z-10 tw:flex tw:items-center tw:pl-1 tw:pr-8 tw:cursor-pointer tw:text-widget-text-secondary tw:hover:text-widget-text tw:transition-colors"
              style={{ background: "linear-gradient(to right, var(--color-widget-scroll-fade), transparent)" }}
            >←</button>
          )}
          <button
            onClick={() => scrollBy("right")}
            disabled={!canRight}
            className={`tw:absolute tw:right-0 tw:inset-y-0 tw:z-10 tw:flex tw:items-center tw:pl-8 tw:pr-1 tw:transition-all tw:text-widget-text-secondary tw:hover:text-widget-text ${canRight ? "tw:opacity-100 tw:cursor-pointer" : "tw:opacity-0 tw:pointer-events-none"}`}
            style={{ background: "linear-gradient(to left, var(--color-widget-scroll-fade), transparent)" }}
          >→</button>
        </div>
      </div>
    </div>
  );
}
