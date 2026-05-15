export type Variant = {
    id: string;
    title: string;
    price: { amount: string };
    image?: { url: string };
}

export type Product = {
    id: string;
    handle: string;
    title: string;
    imgUrl: string;
    url: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    variants?: Variant[];
}
