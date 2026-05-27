import { useState } from "react";
import type { Product } from "../models/types";

export function ProductHero({ title, description, images = [], price, url }: Product) {
  const [imageIndex, setImageIndex] = useState(0);

  const canNext = imageIndex < images.length - 1;
  const canPrev = imageIndex > 0;

  const formattedPrice = price?.amount
    ? `${parseFloat(price.amount).toFixed(2)} ${price.currencyCode ?? ""}`.trim()
    : null;

  return (
    <div className="flex gap-8 py-8 border-b border-gray-200">

      {/* colonna sinistra 40% — info prodotto */}
      <div className="w-[40%] flex flex-col gap-4">

        <h2 className="text-2xl font-semibold text-gray-900 leading-tight">{title}.</h2>

        <button className="flex items-center justify-between w-full px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded">
          <span>Add to cart</span>
          {formattedPrice && (
            <div className="flex items-center gap-2">
              <span>{formattedPrice}</span>
              <span className="text-base leading-none">+</span>
            </div>
          )}
        </button>

        {description && (
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        )}

        {url && (
          <div className="mt-auto">
            <a href={url} className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              see on the traditional shop →
            </a>
          </div>
        )}
      </div>

      {/* colonna destra 60% — carosello orizzontale */}
      <div className="w-[60%] relative h-72 bg-gray-100 rounded-lg overflow-hidden">
        {images.length > 0 ? (
          <>
            {/* immagine corrente */}
            <img
              key={imageIndex}
              src={images[imageIndex].url}
              alt={images[imageIndex].altText ?? title}
              className="w-full h-full object-contain transition-opacity duration-200"
            />

            {/* frecce */}
            {canPrev && (
              <button
                onClick={() => setImageIndex((i) => i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                aria-label="Immagine precedente"
              >
                ←
              </button>
            )}
            {canNext && (
              <button
                onClick={() => setImageIndex((i) => i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                aria-label="Immagine successiva"
              >
                →
              </button>
            )}

            {/* indicatori */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imageIndex ? "bg-gray-800" : "bg-gray-400"}`}
                    aria-label={`Immagine ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            no image
          </div>
        )}
      </div>
    </div>
  );
}
