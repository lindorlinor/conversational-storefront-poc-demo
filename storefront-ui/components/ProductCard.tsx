import { Product } from "../models/types";
import { variantUrl } from "../utils/storefront";

export function ProductCardSkeleton() {
    return (
        <div className="tw:animate-pulse tw:flex-shrink-0 tw:w-[var(--size-widget-card)] tw:rounded-widget-card tw:overflow-hidden tw:border tw:border-widget-border">
            <div className="tw:aspect-square tw:bg-widget-card-image tw:border tw:border-widget-card-image-border" />
            <div className="tw:p-3 tw:flex tw:flex-col tw:gap-2">
                <div className="tw:h-4 tw:bg-widget-surface tw:rounded tw:w-3/4" />
                <div className="tw:h-3 tw:bg-widget-surface tw:rounded tw:w-1/2" />
                <div className="tw:h-8 tw:bg-widget-surface tw:rounded tw:w-1/3 tw:self-end tw:mt-1" />
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
                    className="tw:flex-shrink-0 tw:w-[var(--size-widget-card)] tw:rounded-widget-card tw:overflow-hidden tw:border tw:border-widget-border tw:bg-widget-card"
                >
                    <a href={cardUrl} className="tw:block tw:aspect-square tw:overflow-hidden tw:bg-widget-card-image tw:border tw:border-widget-card-image-border tw:group">
                        <img
                            src={cardImgUrl}
                            alt={title ?? ''}
                            className="tw:w-full tw:h-full tw:object-cover tw:transition-transform tw:duration-300 tw:group-hover:scale-105"
                        />
                    </a>
                    <div className="tw:p-3 tw:flex tw:flex-col tw:gap-1">
                        <p className="tw:m-0 tw:text-sm tw:font-semibold tw:text-widget-text tw:leading-snug tw:line-clamp-2">{title}</p>
                        {variantTitle && (
                            <p className="tw:font-widget-secondary tw:m-0 tw:text-xs tw:text-widget-text-secondary">{variantTitle}</p>
                        )}
                        <div className="tw:flex tw:items-center tw:justify-between tw:mt-2">
                            <span className="tw:font-widget-secondary tw:text-sm tw:font-bold tw:text-widget-text-secondary">{price} {currencyCode}</span>
                            <a
                                href={cardUrl}
                                className="tw:font-widget-secondary tw:rounded-widget-base tw:text-xs tw:px-3 tw:py-1.5 tw:bg-widget-accent tw:text-widget-accent-fg tw:font-medium tw:no-underline tw:border tw:border-widget-accent-fg"
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
