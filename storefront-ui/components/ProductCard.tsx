import { Product } from "../models/types";
import { variantUrl } from "../utils/storefront";

export function ProductCardSkeleton() {
    return (
        <div className="animate-pulse flex-shrink-0 w-[216px] rounded-widget-base overflow-hidden border border-widget-border">
            <div className="aspect-square bg-widget-surface" />
            <div className="p-3 flex flex-col gap-2 border-t border-widget-border">
                <div className="h-4 bg-widget-surface rounded w-3/4" />
                <div className="h-3 bg-widget-surface rounded w-1/2" />
                <div className="h-8 bg-widget-surface rounded w-1/3 self-end mt-1" />
            </div>
        </div>
    );
}

const ProductCard = (product: Product) => {
    const { title, url, imgUrl, price: productPrice, variants } = product;

    const imgUrlPartial = !!imgUrl && (() => { try { new URL(imgUrl); return false; } catch { return true; } })();
    if (imgUrlPartial) return <ProductCardSkeleton />;

    const currencyCode = productPrice?.currencyCode;

    const cards = variants && variants.length > 0
        ? variants.map((variant, i) => ({
            key: variant.id ?? i,
            imgUrl: variant.image?.url ?? imgUrl ?? '',
            url: variant.id && url ? variantUrl(url, variant.id) : url ?? '',
            price: variant.price?.amount ? parseFloat(variant.price.amount).toFixed(2) : '...',
            variantTitle: variant.title,
        }))
        : [{
            key: 'product',
            imgUrl: imgUrl ?? '',
            url: url ?? '',
            price: productPrice?.amount ? parseFloat(productPrice.amount).toFixed(2) : '...',
            variantTitle: undefined,
        }];

    return (
        <>
            {cards.map(({ key, imgUrl: cardImgUrl, url: cardUrl, price, variantTitle }) => (
                <div
                    key={key}
                    className="flex-shrink-0 w-[216px] rounded-widget-base overflow-hidden border border-widget-border bg-widget-card"
                >
                    <a href={cardUrl} className="block aspect-square overflow-hidden bg-widget-surface group">
                        <img
                            src={cardImgUrl}
                            alt={title ?? ''}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </a>
                    <div className="border-t border-widget-border p-3 flex flex-col gap-1">
                        <p className="m-0 text-sm font-semibold text-widget-text leading-snug line-clamp-2">{title}</p>
                        {variantTitle && (
                            <p className="m-0 text-xs text-widget-text-secondary">{variantTitle}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-widget-text-secondary">{price} {currencyCode}</span>
                            <a
                                href={cardUrl}
                                className="rounded-widget-base text-xs px-3 py-1.5 bg-widget-accent text-widget-accent-fg font-medium no-underline"
                                style={{ textDecoration: 'none' }}
                            >
                                View
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

export default ProductCard
