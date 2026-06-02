import { useState } from "react";
import type { Product, Variant } from "../models/types";
import { addToCartExecute } from "../utils/utils";
import { getCartId, setCartId } from "../utils/storefront";

type VariantOption = Variant & { available?: boolean };

type VariantSelectorProps = Omit<Product, "variants" | "description"> & {
  description?: string | null;
  variants?: VariantOption[];
  variantLabel?: string;
};

export function VariantSelector({
  title,
  description,
  images = [],
  price,
  url,
  variants = [],
  variantLabel = "Variante",
}: VariantSelectorProps) {
  const [selected, setSelected] = useState<VariantOption | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayImages =
    selected?.image?.url
      ? [{ url: selected.image.url, altText: selected.title }]
      : images;

  const displayPrice = selected?.price?.amount
    ? { amount: selected.price.amount, currencyCode: price?.currencyCode }
    : null;

  const formattedPrice = displayPrice?.amount
    ? `${parseFloat(displayPrice.amount).toFixed(2)} ${displayPrice.currencyCode ?? ""}`.trim()
    : null;

  const canPrev = imageIndex > 0;
  const canNext = imageIndex < displayImages.length - 1;

  const handleSelect = (variant: VariantOption) => {
    if (selected?.id === variant.id && selected?.title === variant.title) {
      setSelected(null);
    } else {
      setSelected(variant);
    }
    setImageIndex(0);
    setAdded(false);
    setError(null);
  };

  const handleAddToCart = async () => {
    const variantId = selected?.id ?? variants[0]?.id;
    if (!variantId || isAdding) return;
    try {
      setIsAdding(true);
      setError(null);
      const result = await addToCartExecute({ rawCartId: getCartId(), variantId, quantity: 1 });
      if ("newCartId" in result && result.newCartId) setCartId(result.newCartId);
      setAdded(true);
      setTimeout(() => setAdded(false), 1900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossibile aggiungere al carrello");
    } finally {
      setIsAdding(false);
    }
  };

  const ctaDisabled = isAdding || !selected?.id;

  return (
    <div className="flex bg-white overflow-hidden max-w-[70rem] mx-auto">

      {/* Gallery */}
      <div className="relative w-[35%] flex-none bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6 min-h-[360px]">
        {displayImages.length > 0 ? (
          <>
            <img
              key={`${selected?.title ?? ""}-${imageIndex}`}
              src={displayImages[imageIndex].url}
              alt={displayImages[imageIndex].altText ?? title}
              className="max-w-full max-h-72 object-contain"
            />
            {canPrev && (
              <button
                onClick={() => setImageIndex((i) => i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-700 hover:opacity-50 transition-opacity"
                aria-label="Immagine precedente"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            )}
            {canNext && (
              <button
                onClick={() => setImageIndex((i) => i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-700 hover:opacity-50 transition-opacity"
                aria-label="Immagine successiva"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            )}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {displayImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === imageIndex ? "bg-gray-900" : "bg-gray-400"}`}
                    aria-label={`Immagine ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400 text-sm">Nessuna immagine</div>
        )}
      </div>

      {/* Detail */}
      <div className="flex-1 flex flex-col justify-center px-10 py-8 gap-0">
        {title && (
          <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900 mb-3 leading-tight">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-prose">{description}</p>
        )}

        {/* Variant selector */}
        {variants.length > 0 && (
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-900">{variantLabel}</span>
              <span className="text-sm text-gray-500">
                {selected ? (
                  <>Selezionata: <b className="text-gray-900 font-bold">{selected.title}</b></>
                ) : (
                  "Nessuna selezione"
                )}
              </span>
            </div>

            {/* Hint */}
            {!selected && (
              <p className="text-xs flex items-center gap-2 mb-4 text-gray-400">
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] border-[1.5px] rounded-full text-[11px] font-bold flex-none border-current">
                  1
                </span>
                {`Scegli ${variantLabel.toLowerCase()} per continuare`}
              </p>
            )}

            {/* Chips */}
            <div className="flex flex-wrap gap-2.5" role="group" aria-label={variantLabel}>
              {variants.map((v) => {
                const isAvailable = v.available !== false;
                const isSelected = selected?.id === v.id && selected?.title === v.title;
                return (
                  <button
                    key={v.id ?? v.title}
                    onClick={() => isAvailable && handleSelect(v)}
                    disabled={!isAvailable}
                    aria-pressed={isSelected}
                    aria-label={`${variantLabel} ${v.title}${!isAvailable ? " — esaurito" : ""}`}
                    className={[
                      "min-w-[58px] h-[54px] px-3.5 border-[1.5px] text-base font-semibold flex items-center justify-center transition-all duration-100",
                      isSelected
                        ? "bg-gray-900 text-white border-gray-900"
                        : isAvailable
                        ? "bg-white text-gray-900 border-gray-300 hover:border-gray-900 active:scale-95 cursor-pointer"
                        : "bg-white text-gray-400 border-gray-200 cursor-not-allowed [background-image:linear-gradient(to_top_right,transparent_calc(50%-1px),#d2d2d0_50%,transparent_calc(50%+1px)),linear-gradient(to_top_left,transparent_calc(50%-1px),#d2d2d0_50%,transparent_calc(50%+1px))]",
                    ].join(" ")}
                  >
                    {v.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Buy bar */}
        <div className="mt-5 pt-5 border-t border-gray-200 flex items-end gap-5">
          {formattedPrice && (
            <div className="flex flex-col gap-0.5 flex-none">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Prezzo</span>
              <span className="text-2xl font-bold tracking-tight text-gray-900">{formattedPrice}</span>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={ctaDisabled}
            className={[
              "flex-1 h-14 relative overflow-hidden flex items-center justify-center gap-3 font-bold text-sm tracking-wide transition-all",
              ctaDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-black active:translate-y-px cursor-pointer",
            ].join(" ")}
          >
            {/* default label */}
            <span
              className={`flex items-center gap-3 transition-all duration-300 ${added ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {selected
                ? "Aggiungi al carrello"
                : `Seleziona ${variantLabel.toLowerCase()}`}
            </span>

            {/* success label */}
            <span
              className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300 ${added ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Aggiunto al carrello
            </span>
          </button>
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        {url && (
          <a href={url} className="mt-4 text-xs text-gray-400 hover:text-gray-700 transition-colors self-start">
            vedi nel negozio →
          </a>
        )}
      </div>
    </div>
  );
}
