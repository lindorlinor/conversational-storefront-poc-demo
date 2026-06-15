import { useState } from "react";
import type { Product, Variant } from "../models/types";
import { cart } from "../cart";

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
      await cart.addLine(variantId);
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
    <div className="tw:flex tw:bg-widget-card tw:overflow-hidden tw:max-w-[70rem] tw:mx-auto">

      {/* Gallery */}
      <div className="tw:relative tw:w-[45%] tw:flex-none tw:bg-widget-surface tw:flex tw:items-center tw:justify-center tw:p-4 tw:min-h-[480px]">
        {displayImages.length > 0 ? (
          <>
            <img
              key={`${selected?.title ?? ""}-${imageIndex}`}
              src={displayImages[imageIndex].url}
              alt={displayImages[imageIndex].altText ?? title}
              className="tw:max-w-full tw:max-h-[440px] tw:object-contain"
            />
            {canPrev && (
              <button
                onClick={() => setImageIndex((i) => i - 1)}
                className="tw:absolute tw:left-0 tw:inset-y-0 tw:z-10 tw:flex tw:items-center tw:pl-1 tw:pr-8 tw:cursor-pointer tw:text-widget-text-secondary tw:hover:text-widget-text tw:transition-colors"
                style={{ background: "linear-gradient(to right, var(--color-widget-scroll-fade), transparent)" }}
                aria-label="Immagine precedente"
              >←</button>
            )}
            <button
              onClick={() => setImageIndex((i) => i + 1)}
              disabled={!canNext}
              className={`tw:absolute tw:right-0 tw:inset-y-0 tw:z-10 tw:flex tw:items-center tw:pl-8 tw:pr-1 tw:transition-all tw:text-widget-text-secondary tw:hover:text-widget-text ${canNext ? "tw:opacity-100 tw:cursor-pointer" : "tw:opacity-0 tw:pointer-events-none"}`}
              style={{ background: "linear-gradient(to left, var(--color-widget-scroll-fade), transparent)" }}
              aria-label="Immagine successiva"
            >→</button>
            {displayImages.length > 1 && (
              <div className="tw:absolute tw:bottom-4 tw:left-1/2 tw:-translate-x-1/2 tw:flex tw:gap-2">
                {displayImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`tw:w-2 tw:h-2 tw:rounded-full tw:transition-colors ${i === imageIndex ? "tw:bg-widget-accent" : "tw:bg-widget-text-muted"}`}
                    aria-label={`Immagine ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="tw:text-widget-text-muted tw:text-sm">Nessuna immagine</div>
        )}
      </div>

      {/* Detail */}
      <div className="tw:flex-1 tw:flex tw:flex-col tw:justify-center tw:px-10 tw:py-8 tw:gap-0">
        {title && (
          <h2 className="tw:text-2xl tw:font-bold tw:uppercase tw:tracking-tight tw:text-widget-text tw:mb-3 tw:leading-tight">
            {title}
          </h2>
        )}
        {description && (
          <p className="tw:font-widget-secondary tw:text-sm tw:text-widget-text-secondary tw:leading-relaxed tw:mb-5 tw:max-w-prose">{description}</p>
        )}

        {/* Variant selector */}
        {variants.length > 0 && (
          <div className="tw:border-t tw:border-widget-border tw:pt-5">
            <div className="tw:flex tw:items-baseline tw:justify-between tw:gap-3 tw:mb-1">
              <span className="tw:text-xs tw:font-bold tw:uppercase tw:tracking-widest tw:text-widget-text">{variantLabel}</span>
              <span className="tw:text-sm tw:text-widget-text-secondary">
                {selected ? (
                  <>Selezionata: <b className="tw:text-widget-text tw:font-bold">{selected.title}</b></>
                ) : (
                  "Nessuna selezione"
                )}
              </span>
            </div>

            {/* Hint */}
            {!selected && (
              <p className="tw:text-xs tw:flex tw:items-center tw:gap-2 tw:mb-4 tw:text-widget-text-muted">
                <span className="tw:inline-flex tw:items-center tw:justify-center tw:w-[18px] tw:h-[18px] tw:border-[1.5px] tw:rounded-full tw:text-[11px] tw:font-bold tw:flex-none tw:border-current">
                  1
                </span>
                {`Scegli ${variantLabel.toLowerCase()} per continuare`}
              </p>
            )}

            {/* Chips */}
            <div className="tw:flex tw:flex-wrap tw:gap-2.5" role="group" aria-label={variantLabel}>
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
                      "tw:font-widget-secondary tw:min-w-[58px] tw:h-[54px] tw:px-3.5 tw:border-[1.5px] tw:rounded-widget-base tw:text-base tw:font-semibold tw:flex tw:items-center tw:justify-center tw:transition-all tw:duration-100",
                      isSelected
                        ? "tw:bg-widget-accent tw:text-widget-accent-fg tw:border-widget-accent-fg"
                        : isAvailable
                        ? "tw:bg-widget-bg tw:text-widget-text tw:border-widget-border tw:hover:border-widget-accent tw:active:scale-95 tw:cursor-pointer"
                        : "tw:bg-widget-bg tw:text-widget-text-muted tw:border-widget-border tw:cursor-not-allowed tw:[background-image:linear-gradient(to_top_right,transparent_calc(50%-1px),#d2d2d0_50%,transparent_calc(50%+1px)),linear-gradient(to_top_left,transparent_calc(50%-1px),#d2d2d0_50%,transparent_calc(50%+1px))]",
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
        <div className="tw:mt-5 tw:pt-5 tw:border-t tw:border-widget-border tw:flex tw:items-end tw:gap-5">
          {formattedPrice && (
            <div className="tw:font-widget-secondary tw:flex tw:flex-col tw:gap-0.5 tw:flex-none">
              <span className=" tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-widest tw:text-widget-text-muted">Prezzo</span>
              <span className="tw:text-2xl tw:font-bold tw:tracking-tight tw:text-widget-text">{formattedPrice}</span>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={ctaDisabled}
            className={[
              "tw:flex-1 tw:h-14 tw:relative tw:overflow-hidden tw:rounded-widget-base tw:border tw:flex tw:items-center tw:justify-center tw:gap-3 tw:font-bold tw:text-sm tw:tracking-wide tw:transition-all",
              ctaDisabled
                ? "tw:bg-widget-surface tw:text-widget-text-muted tw:border-widget-border tw:cursor-not-allowed"
                : "tw:bg-widget-accent tw:text-widget-accent-fg tw:border-widget-accent-fg tw:hover:bg-black tw:active:translate-y-px tw:cursor-pointer",
            ].join(" ")}
          >
            {/* default label */}
            <span
              className={`tw:flex tw:items-center tw:gap-3 tw:transition-all tw:duration-300 ${added ? "tw:-translate-y-full tw:opacity-0" : "tw:translate-y-0 tw:opacity-100"}`}
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
              className={`tw:absolute tw:inset-0 tw:flex tw:items-center tw:justify-center tw:gap-3 tw:transition-all tw:duration-300 ${added ? "tw:translate-y-0 tw:opacity-100" : "tw:translate-y-full tw:opacity-0"}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Aggiunto al carrello
            </span>
          </button>
        </div>

        {error && <p className="tw:mt-2 tw:text-xs tw:text-widget-error">{error}</p>}

        {url && (
          <a href={url} className="tw:mt-4 tw:text-xs tw:text-widget-text-muted tw:hover:text-widget-text tw:transition-colors tw:self-start">
            vedi nel negozio →
          </a>
        )}
      </div>
    </div>
  );
}
