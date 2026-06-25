import { useRef, useState, useEffect } from 'react';
import { ProductCard, ProductCardSkeleton} from './ProductCard';
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
      getComputedStyle(document.documentElement).getPropertyValue('--tw-size-widget-card').trim()
    ) || 216;
    el.scrollBy({ left: dir === 'right' ? cardPx + 12 : -(cardPx + 12), behavior: 'smooth' });
  };

  if (!products?.length) {
    return (
      <div className="tw:w-full tw:overflow-x-auto">
        <div className="tw:flex tw:gap-3 tw:flex-nowrap tw:pb-2 tw:w-max">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tw:w-full tw:relative tw:py-8">
      <div ref={scrollRef} className="tw:overflow-x-auto tw:pb-2">
        <div className="tw:flex tw:gap-3 tw:flex-nowrap tw:w-max">
          {products.map((p, i) => (
            <ProductCard key={p.id ?? i} {...p} />
          ))}
        </div>
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scrollBy('left')}
          className="tw:absolute tw:left-0 tw:inset-y-0 tw:z-10 tw:flex tw:items-center tw:pl-1 tw:pr-8 tw:cursor-pointer tw:text-widget-text-secondary tw:hover:text-widget-text tw:transition-colors"
          style={{ background: 'linear-gradient(to right, var(--color-widget-scroll-fade), transparent)' }}
          aria-label="Scorri a sinistra"
        >
          ←
        </button>
      )}

      <button
        onClick={() => scrollBy('right')}
        disabled={!canScrollRight}
        className={`tw:absolute tw:right-0 tw:inset-y-0 tw:z-10 tw:flex tw:items-center tw:pl-8 tw:pr-1 tw:transition-all tw:text-widget-text-secondary tw:hover:text-widget-text ${
          canScrollRight ? 'tw:opacity-100 tw:cursor-pointer' : 'tw:opacity-0 tw:pointer-events-none'
        }`}
        style={{ background: 'linear-gradient(to left, var(--color-widget-scroll-fade), transparent)' }}
        aria-label="Scorri a destra"
      >
        →
      </button>
    </div>
  );
}
