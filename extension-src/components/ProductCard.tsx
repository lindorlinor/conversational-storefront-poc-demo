import { Product } from "../models/types";
const ProductCard = (product: Product) => {

    const { id, title , imgUrl } = product;
  return (
    <s-grid justifyItems="center" alignItems="center" minBlockSize="300px">
        <s-box
        border="base"
        borderRadius="base"
        overflow="hidden"
        maxInlineSize="216px"
        >
        <s-clickable href="">
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
            <s-heading>{title}</s-heading>
            <s-button href="" accessibilityLabel="View 4-pieces puzzle template">
            View
            </s-button>
        </s-grid>
        </s-box>
    </s-grid>
  )
}
export default ProductCard