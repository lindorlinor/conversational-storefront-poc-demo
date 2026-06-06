import { useRef, useState, useEffect } from 'react';
import { ProductCard } from './index';
import { ProductCardSkeleton } from './ProductCard';
import { Product } from '../models/types';

const PLACEHOLDER_COUNT = 3;

export function ProductList({ products }: { products?: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardPx = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--size-widget-card').trim()
    ) || 216;
    el.scrollBy({ left: dir === 'right' ? cardPx + 12 : -(cardPx + 12), behavior: 'smooth' });
  };

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
    <div className="w-full relative py-8">
      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <div className="flex gap-3 flex-nowrap w-max">
          {products.map((p, i) => (
            <ProductCard key={p.id ?? i} {...p} />
          ))}
        </div>
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scrollBy('left')}
          className="absolute left-0 inset-y-0 z-10 flex items-center pl-1 pr-8 cursor-pointer text-widget-text-secondary hover:text-widget-text transition-colors"
          style={{ background: 'linear-gradient(to right, var(--color-widget-scroll-fade), transparent)' }}
          aria-label="Scorri a sinistra"
        >
          ←
        </button>
      )}

      <button
        onClick={() => scrollBy('right')}
        disabled={!canScrollRight}
        className={`absolute right-0 inset-y-0 z-10 flex items-center pl-8 pr-1 transition-all text-widget-text-secondary hover:text-widget-text ${
          canScrollRight ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'linear-gradient(to left, var(--color-widget-scroll-fade), transparent)' }}
        aria-label="Scorri a destra"
      >
        →
      </button>
    </div>
  );
}
