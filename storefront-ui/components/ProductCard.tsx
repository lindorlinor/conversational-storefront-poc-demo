import { Product } from "../models/types";
import { variantUrl } from "../utils/storefront";

export function ProductCardSkeleton() {
    return (
        <div className="animate-pulse rounded-lg overflow-hidden border border-gray-200 w-full">
            <div className="aspect-square bg-gray-200" />
            <div className="p-3 flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-1/3 self-end" />
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
                <s-grid key={key} justifyItems="center" alignItems="center" minBlockSize="300px">
                    <s-box border="base" borderRadius="base" overflow="hidden" maxInlineSize="216px">
                        <s-clickable href={cardUrl}>
                            <s-image aspectRatio="1/1" objectFit="cover" alt={title} src={cardImgUrl} />
                        </s-clickable>
                        <s-divider />
                        <s-grid gridTemplateColumns="1fr auto" background="base" padding="small" gap="small" alignItems="center">
                            <s-box>
                                <s-heading>{title}</s-heading>
                                <s-text>{variantTitle && `${variantTitle} — `}{price} {currencyCode}</s-text>
                            </s-box>
                            <s-button href={cardUrl} accessibilityLabel={`View ${title}`}>View</s-button>
                        </s-grid>
                    </s-box>
                </s-grid>
            ))}
        </>
    );
}

export default ProductCard
