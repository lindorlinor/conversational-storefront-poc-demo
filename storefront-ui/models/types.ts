export type Variant = {
    id?: string;
    title?: string;
    price?: { amount?: string };
    image?: { url?: string };
    url?: string;
}

export type ProductImage = { url: string; altText?: string }

export type Product = {
    id?: string;
    handle?: string;
    title?: string;
    description?: string;
    imgUrl?: string;
    images?: ProductImage[];
    url?: string;
    price?: { amount?: string; currencyCode?: string };
    variants?: Variant[];
    defaultVariantId?: string;
}

export type Collection = {
    id?: string;
    handle?: string;
    title?: string;
    description?: string;
    image?: { url?: string; altText?: string };
}
