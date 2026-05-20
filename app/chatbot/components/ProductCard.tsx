import { Product, Variant } from "../models/types";
import { variantUrl } from "../utils";

const VariantCard = ({ variant, productTitle, productImgUrl, productUrl }: {
  variant: Variant; productTitle: string; productImgUrl: string; productUrl: string;
}) => {
  if (!variant?.price?.amount || !variant.id) return null;
  const price = parseFloat(variant.price.amount).toFixed(2);
  const imgUrl = variant.image?.url ?? productImgUrl;
  const url = variantUrl(productUrl, variant.id);

  return (
    <s-grid justifyItems="center" alignItems="center" minBlockSize="300px">
      <s-box border="base" borderRadius="base" overflow="hidden" maxInlineSize="216px">
        <s-clickable href={url}>
          <s-image aspectRatio="1/1" objectFit="cover" alt={productTitle} src={imgUrl} />
        </s-clickable>
        <s-divider />
        <s-grid gridTemplateColumns="1fr auto" background="base" padding="small" gap="small" alignItems="center">
          <s-box>
            <s-heading>{productTitle}</s-heading>
            <s-text>{variant.title} — {price} EUR</s-text>
          </s-box>
          <s-button href={url} accessibilityLabel={`View ${productTitle}`}>View</s-button>
        </s-grid>
      </s-box>
    </s-grid>
  );
};

const ProductCard = (product: Product) => {
  const { title, url, imgUrl, priceRange, variants } = product;
  if (!priceRange?.minVariantPrice || !url || !title) return null;
  const price = parseFloat(priceRange.minVariantPrice.amount).toFixed(2);

  if (variants && variants.length > 0) {
    return (
      <>
        {variants.map((variant) => (
          <VariantCard key={variant.id} variant={variant} productTitle={title} productImgUrl={imgUrl} productUrl={url} />
        ))}
      </>
    );
  }

  return (
    <s-grid justifyItems="center" alignItems="center" minBlockSize="300px">
      <s-box border="base" borderRadius="base" overflow="hidden" maxInlineSize="216px">
        <s-clickable href={url}>
          <s-image aspectRatio="1/1" objectFit="cover" alt={title} src={imgUrl} />
        </s-clickable>
        <s-divider />
        <s-grid gridTemplateColumns="1fr auto" background="base" padding="small" gap="small" alignItems="center">
          <s-box>
            <s-heading>{title}</s-heading>
            <s-text>{price} EUR</s-text>
          </s-box>
          <s-button href={url} accessibilityLabel={`View ${title}`}>View</s-button>
        </s-grid>
      </s-box>
    </s-grid>
  );
};

export default ProductCard;
