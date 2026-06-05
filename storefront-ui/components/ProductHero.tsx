import { useState } from "react";
import type { Product, Variant } from "../models/types";
import { addToCartExecute } from "../utils/utils";
import { getCartId, setCartId } from "../utils/storefront";

type ProductHeroProps = Product & { selectedVariantTitle?: string };

export function ProductHero({ title, description, images = [], price, url, variants = [], selectedVariantTitle }: ProductHeroProps) {
  const initialVariant = selectedVariantTitle ? (variants.find(v => v.title === selectedVariantTitle) ?? null) : null;

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(initialVariant);
  const [imageIndex, setImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayImages = selectedVariant?.image?.url ? [{ url: selectedVariant.image.url, altText: selectedVariant.title }] : images;

  const displayPrice = selectedVariant?.price?.amount ? { amount: selectedVariant.price.amount, currencyCode: price?.currencyCode }: price;

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    setImageIndex(0);
  };

  const handleAddToCart = async () => {
    console.log('selectedVariant:', selectedVariant);
    const variantId = selectedVariant?.id ?? variants[0]?.id;
    if (!variantId || isAdding) return;

    try {
      setIsAdding(true);
      setError(null);

      const result = await addToCartExecute({
        rawCartId: getCartId(),
        variantId,
        quantity: 1,
      });

      if ("newCartId" in result && result.newCartId) {
        setCartId(result.newCartId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossibile aggiungere al carrello");
    } finally {
      setIsAdding(false);
    }
  };

  const canNext = imageIndex < displayImages.length - 1;
  const canPrev = imageIndex > 0;

  const formattedPrice = displayPrice?.amount
    ? `${parseFloat(displayPrice.amount).toFixed(2)} ${displayPrice.currencyCode ?? ""}`.trim()
    : null;

  return (
    <div className="flex gap-8 py-8">

      {/* colonna sinistra 40% — info prodotto */}
      <div className="w-[40%] flex flex-col gap-4">

        <h2 className="text-2xl font-semibold text-widget-text leading-tight">{title}.</h2>

        {variants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button key={v.id ?? v.title} onClick={() => handleVariantSelect(v)} className={`px-3 py-1.5 text-xs font-medium rounded-widget-base border transition-colors ${ selectedVariant?.title === v.title ? "bg-widget-accent text-widget-accent-fg border-widget-accent" : "bg-widget-bg text-widget-text-secondary border-widget-border hover:border-widget-accent"}`} >
                {v.title}
              </button>
            ))}
          </div>
        )}

        <button onClick={handleAddToCart} disabled={isAdding || (!selectedVariant?.id && !variants[0]?.id)} className="flex items-center justify-between w-full px-3 py-2 bg-widget-accent text-widget-accent-fg text-sm font-medium rounded-widget-base disabled:opacity-50 disabled:cursor-not-allowed">
          <span>Add to cart</span>
          {formattedPrice && (
            <div className="flex items-center gap-2">
              <span>{isAdding ? "..." : formattedPrice}</span>
              <span className="text-base leading-none">+</span>
            </div>
          )}
        </button>

        {error && (
          <p className="text-xs text-widget-error leading-relaxed">{error}</p>
        )}

        {description && (
          <p className="text-xs text-widget-text-secondary leading-relaxed">{description}</p>
        )}

        {url && (
          <div className="mt-auto">
            <a href={url} className="text-xs text-widget-text-secondary hover:text-widget-text transition-colors">
              see on the traditional shop →
            </a>
          </div>
        )}
      </div>

      <div className="w-[60%] relative h-72 bg-widget-surface rounded-lg overflow-hidden">
        {displayImages.length > 0 ? (
          <>
            <img
              key={`${selectedVariant?.title ?? ""}-${imageIndex}`}
              src={displayImages[imageIndex].url}
              alt={displayImages[imageIndex].altText ?? title}
              className="w-full h-full object-contain transition-opacity duration-200"
            />

            {canPrev && (
              <button
                onClick={() => setImageIndex((i) => i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-widget-bg/80 backdrop-blur-sm border border-widget-border rounded-full flex items-center justify-center hover:bg-widget-bg transition-colors shadow-sm"
                aria-label="Immagine precedente"
              >
                ←
              </button>
            )}
            {canNext && (
              <button
                onClick={() => setImageIndex((i) => i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-widget-bg/80 backdrop-blur-sm border border-widget-border rounded-full flex items-center justify-center hover:bg-widget-bg transition-colors shadow-sm"
                aria-label="Immagine successiva"
              >
                →
              </button>
            )}

            {displayImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {displayImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imageIndex ? "bg-widget-accent" : "bg-widget-text-muted"}`}
                    aria-label={`Immagine ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-widget-text-muted text-sm">
            no image
          </div>
        )}
      </div>
    </div>
  );
}
