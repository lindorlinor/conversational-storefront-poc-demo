import { useState, useRef, useEffect } from "react";
import type { Product, Variant } from "../models/types";
import { addToCartExecute } from "../utils/utils";
import { getCartId, setCartId } from "../utils/storefront";

type ProductHeroProps = Product & { selectedVariantTitle?: string };

export function ProductHero({ title, description, images = [], price, url, variants = [], selectedVariantTitle }: ProductHeroProps) {
  const initialVariant = selectedVariantTitle ? (variants.find(v => v.title === selectedVariantTitle) ?? null) : null;

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(initialVariant);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    console.log('selectedVariant:', selectedVariant);
    const variantId = selectedVariant?.id ?? variants[0]?.id;
    if (!variantId || isAdding) return;
    try {
      setIsAdding(true);
      setError(null);
      const result = await addToCartExecute({ rawCartId: getCartId(), variantId, quantity: 1 });
      if ("newCartId" in result && result.newCartId) setCartId(result.newCartId);
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
    <div className="flex gap-8 py-8">

      {/* colonna sinistra 40% — info prodotto */}
      <div className="w-[40%] flex flex-col gap-4">

        <h2 className="text-2xl font-semibold text-widget-text leading-tight">{title}.</h2>

        {variants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button key={v.id ?? v.title} onClick={() => handleVariantSelect(v)} className={`font-widget-secondary px-3 py-1.5 text-xs font-medium rounded-widget-base border transition-colors ${selectedVariant?.title === v.title ? "bg-widget-accent text-widget-accent-fg border-widget-accent" : "bg-widget-bg text-widget-text-secondary border-widget-border hover:border-widget-accent"}`}>
                {v.title}
              </button>
            ))}
          </div>
        )}

        <button onClick={handleAddToCart} disabled={isAdding || (!selectedVariant?.id && !variants[0]?.id)} className="font-widget-secondary flex items-center justify-between w-full px-3 py-2 bg-widget-accent text-widget-accent-fg text-sm font-medium rounded-widget-base disabled:opacity-50 disabled:cursor-not-allowed">
          <span>Add to cart</span>
          {formattedPrice && (
            <div className="flex items-center gap-2">
              <span>{isAdding ? "..." : formattedPrice}</span>
              <span className="text-base leading-none">+</span>
            </div>
          )}
        </button>

        {error && <p className="text-xs text-widget-error leading-relaxed">{error}</p>}

        {description && (
          <p className="font-widget-secondary text-xs text-widget-text-secondary leading-relaxed">{description}</p>
        )}

        {url && (
          <div className="mt-auto">
            <a href={url} className="text-xs text-widget-text-secondary hover:text-widget-text transition-colors font-widget-secondary">
              see on the traditional shop →
            </a>
          </div>
        )}
      </div>

      {/* gallery */}
      <div className="w-[60%] relative h-72 rounded-lg overflow-hidden">
        {displayImages.length > 0 ? (
          <>
            <div
              ref={galleryRef}
              className="flex h-full overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {displayImages.map((img, i) => (
                <div key={i} className="flex-shrink-0 h-full aspect-square bg-widget-surface">
                  <img src={img.url} alt={img.altText ?? title} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>

            {canLeft && (
              <button
                onClick={() => scrollBy("left")}
                className="absolute left-0 inset-y-0 z-10 flex items-center pl-1 pr-8 cursor-pointer text-widget-text-secondary hover:text-widget-text transition-colors"
                style={{ background: "linear-gradient(to right, var(--color-widget-scroll-fade), transparent)" }}
                aria-label="Immagine precedente"
              >←</button>
            )}
            <button
              onClick={() => scrollBy("right")}
              disabled={!canRight}
              className={`absolute right-0 inset-y-0 z-10 flex items-center pl-8 pr-1 transition-all text-widget-text-secondary hover:text-widget-text ${canRight ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"}`}
              style={{ background: "linear-gradient(to left, var(--color-widget-scroll-fade), transparent)" }}
              aria-label="Immagine successiva"
            >→</button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-widget-surface text-widget-text-muted text-sm">
            no image
          </div>
        )}
      </div>
    </div>
  );
}
