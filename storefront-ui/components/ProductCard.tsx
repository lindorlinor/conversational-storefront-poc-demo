import { Product, Variant } from "../models/types";
import { variantUrl } from "../utils/url";

const VariantCard = ({ variant, productTitle, productImgUrl, productUrl }: { variant: Variant; productTitle?: string; productImgUrl?: string; productUrl?: string }) => {
    const price = variant.price?.amount ? parseFloat(variant.price.amount).toFixed(2) : '...';
    const imgUrl = variant.image?.url ?? productImgUrl ?? '';
    const url = variant.id && productUrl ? variantUrl(productUrl, variant.id) : productUrl ?? '';

    return (
        <s-grid justifyItems="center" alignItems="center" minBlockSize="300px">
            <s-box
                border="base"
                borderRadius="base"
                overflow="hidden"
                maxInlineSize="216px"
            >
                <s-clickable href={url}>
                    <s-image
                        aspectRatio="1/1"
                        objectFit="cover"
                        alt={productTitle}
                        src={imgUrl}
                    />
                </s-clickable>
                <s-divider />
                <s-grid
                    gridTemplateColumns="1fr auto"
                    background="base"
                    padding="small"
                    gap="small"
                    alignItems="center"
                >
                    <s-box>
                        <s-heading>{productTitle}</s-heading>
                        <s-text>{variant.title} — {price} EUR</s-text>
                    </s-box>
                    <s-button href={url} accessibilityLabel={`View ${productTitle}`}>
                        View
                    </s-button>
                </s-grid>
            </s-box>
        </s-grid>
    );
}

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

    const price = productPrice?.amount
        ? parseFloat(productPrice.amount).toFixed(2)
        : '...';

    if (variants && variants.length > 0) {
        return (
            <>
                {variants.map((variant, i) => (
                    <VariantCard key={variant.id ?? i} variant={variant} productTitle={title} productImgUrl={imgUrl} productUrl={url} />
                ))}
            </>
        );
    }

    return (
        <s-grid justifyItems="center" alignItems="center" minBlockSize="300px">
            <s-box
                border="base"
                borderRadius="base"
                overflow="hidden"
                maxInlineSize="216px"
            >
                <s-clickable href={url}>
                    <s-image
                        aspectRatio="1/1"
                        objectFit="cover"
                        alt={title}
                        src={imgUrl}
                    />
                </s-clickable>
                <s-divider />
                <s-grid
                    gridTemplateColumns="1fr auto"
                    background="base"
                    padding="small"
                    gap="small"
                    alignItems="center"
                >
                    <s-box>
                        <s-heading>{title}</s-heading>
                        <s-text>{price} {productPrice?.currencyCode}</s-text>
                    </s-box>
                    <s-button href={url} accessibilityLabel={`View ${title}`}>
                        View
                    </s-button>
                </s-grid>
            </s-box>
        </s-grid>
    );
}
export default ProductCard
