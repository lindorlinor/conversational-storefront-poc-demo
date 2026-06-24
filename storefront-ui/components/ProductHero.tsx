import { useState, useRef, useEffect } from "react";
import type { Product, Variant } from "../models/types";
import { useAddToCart } from "../add-to-cart-context";

type ProductHeroProps = Product & { selectedVariantTitle?: string };

export function ProductHero({ title, description, images = [], price, url, variants = [], selectedVariantTitle }: ProductHeroProps) {
  const initialVariant = selectedVariantTitle ? (variants.find(v => v.title === selectedVariantTitle) ?? null) : null;

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(initialVariant);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAddToCart = useAddToCart();

  const galleryRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const displayImages = selectedVariant?.image?.url ? [{ url: selectedVariant.image.url, altText: selectedVariant.title }] : images;
  const displayPrice = selectedVariant?.price?.amount ? { amount: selectedVariant.price.amount, currencyCode: price?.currencyCode } : price;

  const updateArrows = () => {
    const el = galleryRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateArrows); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id]);

  const handleVariantSelect = (variant: Variant) => setSelectedVariant(variant);

  const handleAddToCart = async () => {
    const variantId = selectedVariant?.id ?? variants[0]?.id;
    if (!variantId || isAdding || !onAddToCart) return;
    try {
      setIsAdding(true);
      setError(null);
      const res = await onAddToCart(variantId, 1);
      if (!res.success) setError(res.reason);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossibile aggiungere al carrello");
    } finally {
      setIsAdding(false);
    }
  };

  const formattedPrice = displayPrice?.amount
    ? `${parseFloat(displayPrice.amount).toFixed(2)} ${displayPrice.currencyCode ?? ""}`.trim()
    : null;

  const scrollBy = (dir: "left" | "right") => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? el.clientWidth : -el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="tw:flex tw:gap-8 tw:py-8">

      {/* colonna sinistra 40% — info prodotto */}
      <div className="tw:w-[40%] tw:flex tw:flex-col tw:gap-4">

        <h2 className="tw:text-2xl tw:font-semibold tw:text-widget-text tw:leading-tight">{title}.</h2>

        {variants.length > 0 && (
          <div className="tw:flex tw:flex-wrap tw:gap-2">
            {variants.map((v) => (
              <button key={v.id ?? v.title} onClick={() => handleVariantSelect(v)} className={`tw:font-widget-secondary tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:rounded-widget-base tw:border tw:transition-colors ${selectedVariant?.title === v.title ? "tw:bg-widget-accent tw:text-widget-accent-fg tw:border-widget-accent-fg" : "tw:bg-widget-bg tw:text-widget-text-secondary tw:border-widget-accent-fg tw:hover:border-widget-accent"}`}>
                {v.title}
              </button>
            ))}
          </div>
        )}

        <button onClick={handleAddToCart} disabled={isAdding || (!selectedVariant?.id && !variants[0]?.id)} className="tw:font-widget-secondary tw:flex tw:items-center tw:justify-between tw:w-full tw:px-3 tw:py-2 tw:bg-widget-accent tw:text-widget-accent-fg tw:border tw:border-widget-accent-fg tw:text-sm tw:font-medium tw:rounded-widget-base tw:disabled:opacity-50 tw:disabled:cursor-not-allowed">
          <span>Add to cart</span>
          {formattedPrice && (
            <div className="tw:flex tw:items-center tw:gap-2">
              <span>{isAdding ? "..." : formattedPrice}</span>
              <span className="tw:text-base tw:leading-none">+</span>
            </div>
          )}
        </button>

        {error && <p className="tw:text-xs tw:text-widget-error tw:leading-relaxed">{error}</p>}

        {description && (
          <p className="tw:font-widget-secondary tw:text-xs tw:text-widget-text-secondary tw:leading-relaxed">{description}</p>
        )}

        {url && (
          <div className="tw:mt-auto">
            <a href={url} className="tw:text-xs tw:text-widget-text-secondary tw:hover:text-widget-text tw:transition-colors tw:font-widget-secondary">
              see on the traditional shop →
            </a>
          </div>
        )}
      </div>

      {/* gallery */}
      <div className="tw:w-[60%] tw:relative tw:h-72 tw:rounded-lg tw:overflow-hidden">
        {displayImages.length > 0 ? (
          <>
            <div
              ref={galleryRef}
              className="tw:flex tw:h-full tw:overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {displayImages.map((img, i) => (
                <div key={i} className="tw:flex-shrink-0 tw:h-full tw:aspect-square tw:bg-widget-surface">
                  <img src={img.url} alt={img.altText ?? title} className="tw:w-full tw:h-full tw:object-contain" />
                </div>
              ))}
            </div>

            {canLeft && (
              <button
                onClick={() => scrollBy("left")}
                className="tw:absolute tw:left-0 tw:inset-y-0 tw:z-10 tw:flex tw:items-center tw:pl-1 tw:pr-8 tw:cursor-pointer tw:text-widget-text-secondary tw:hover:text-widget-text tw:transition-colors"
                style={{ background: "linear-gradient(to right, var(--color-widget-scroll-fade), transparent)" }}
                aria-label="Immagine precedente"
              >←</button>
            )}
            <button
              onClick={() => scrollBy("right")}
              disabled={!canRight}
              className={`tw:absolute tw:right-0 tw:inset-y-0 tw:z-10 tw:flex tw:items-center tw:pl-8 tw:pr-1 tw:transition-all tw:text-widget-text-secondary tw:hover:text-widget-text ${canRight ? "tw:opacity-100 tw:cursor-pointer" : "tw:opacity-0 tw:pointer-events-none"}`}
              style={{ background: "linear-gradient(to left, var(--color-widget-scroll-fade), transparent)" }}
              aria-label="Immagine successiva"
            >→</button>
          </>
        ) : (
          <div className="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center tw:bg-widget-surface tw:text-widget-text-muted tw:text-sm">
            no image
          </div>
        )}
      </div>
    </div>
  );
}
