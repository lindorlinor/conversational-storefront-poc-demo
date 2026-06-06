import Section from "../components/Section";
import { ProductList } from "../components/ProductList";
import { ProductHero } from "../components/ProductHero";
import { CollectionWidget } from "../components/CollectionWidget";
import { VariantSelector } from "../components/VariantSelector";

const PRODUCTS_1 = [
  {
    id: "1", title: "The Complete Snowboard",
    url: "/products/the-complete-snowboard",
    price: { amount: "699.95", currencyCode: "USD" },
    variants: [
      { id: "61828386226546", title: "Ice",      price: { amount: "699.95" }, image: { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1780334187" } },
      { id: "61828386259314", title: "Dawn",     price: { amount: "699.95" }, image: { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_372ff415-c120-44f1-b534-764c9d5477af.png?v=1780334420" } },
      { id: "61828386292082", title: "Powder",   price: { amount: "599.95" }, image: { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_70aa84cc-0fbd-42fc-8bef-00ec1a07f1fb.png?v=1780334518" } },
      { id: "61828386324850", title: "Electric", price: { amount: "699.95" }, image: { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.png?v=1780334109" } },
      { id: "61828386357618", title: "Sunset",   price: { amount: "699.95" }, image: { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_9797fb8d-5bcb-4b8c-9031-4243ff68a467.png?v=1780334586" } },
    ],
  },
  { id: "2", title: "The Hidden Snowboard",                 url: "/products/the-hidden-snowboard",                 imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_c8ff0b5d-c712-429a-be00-b29bd55cbc9d.jpg?v=1777976347",    price: { amount: "749.95",  currencyCode: "USD" } },
  { id: "3", title: "The 3p Fulfilled Snowboard",           url: "/products/the-3p-fulfilled-snowboard",           imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_b9e0da7f-db89-4d41-83f0-7f417b02831d.jpg?v=1777976348",    price: { amount: "2629.95", currencyCode: "USD" } },
  { id: "4", title: "Shopify Shred Pro Snowboard Bindings", url: "/products/shopify-shred-pro-snowboard-bindings", imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/bindings-snowboard-pro.png?v=1780338089",                       price: { amount: "0.00",    currencyCode: "USD" } },
];

const SKI_WAX = {
  id: "5", title: "Selling Plans Ski Wax",
  description: "",
  images: [{ url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/snowboard_wax.png?v=1777976348", altText: "Snowboard wax" }],
  url: "/products/selling-plans-ski-wax",
  price: { amount: "9.95", currencyCode: "USD" },
  variants: [
    { id: "v-wax-1", title: "Selling Plans Ski Wax",         price: { amount: "9.95" } },
    { id: "v-wax-2", title: "Special Selling Plans Ski Wax", price: { amount: "9.95" } },
    { id: "v-wax-3", title: "Sample Selling Plans Ski Wax",  price: { amount: "9.95" } },
  ],
};

const PRODUCTS_2 = [
  { id: "6", title: "The Minimal Snowboard",      url: "/products/the-minimal-snowboard",      imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/make-contrast-widh-the-background_a4d3d8db-1c0f-4360-b53a-0a1f1ab08c55.png?v=1780411054", price: { amount: "885.95", currencyCode: "USD" } },
  { id: "7", title: "The Videographer Snowboard", url: "/products/the-videographer-snowboard", imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main.jpg?v=1777976348",                                                                    price: { amount: "885.95", currencyCode: "USD" } },
  {
    id: "8", title: "The Collection Snowboard: Liquid blue",
    url: "/products/the-collection-snowboard-liquid",
    price: { amount: "749.95", currencyCode: "USD" },
    variants: [
      { id: "61887113855346", title: "3-8 years", price: { amount: "749.95" }, image: { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_b13ad453-477c-4ed1-9b43-81f3345adfd6.jpg?v=1778853414" } },
      { id: "61887113888114", title: "9-15 years", price: { amount: "749.95" }, image: { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_b13ad453-477c-4ed1-9b43-81f3345adfd6.jpg?v=1778853414" } },
      { id: "61894860800370", title: "Adults",     price: { amount: "749.95" }, image: { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_b13ad453-477c-4ed1-9b43-81f3345adfd6.jpg?v=1778853414" } },
    ],
  },
];

const GIFT_CARD = {
  id: "9", title: "Gift Card",
  description: "This is a gift card for the store",
  images: [{ url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/gift_card.png?v=1777976348", altText: "Gift card" }],
  url: "/products/gift-card",
  price: { amount: "10.00", currencyCode: "USD" },
  variants: [
    { id: "v-gc-10",  title: "$10",  price: { amount: "10.00"  } },
    { id: "v-gc-25",  title: "$25",  price: { amount: "25.00"  } },
    { id: "v-gc-50",  title: "$50",  price: { amount: "50.00"  } },
    { id: "v-gc-100", title: "$100", price: { amount: "100.00" } },
  ],
};

const COLLECTION = {
  title: "Snowboards & Gear",
  description: "Una selezione di tavole e attrezzatura per ogni stile di riding.",
  coverImageUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1780334187",
  products: [
    { id: "2", title: "The Hidden Snowboard",       url: "/products/the-hidden-snowboard",       imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_c8ff0b5d-c712-429a-be00-b29bd55cbc9d.jpg?v=1777976347",    price: { amount: "749.95",  currencyCode: "USD" } },
    { id: "6", title: "The Minimal Snowboard",      url: "/products/the-minimal-snowboard",      imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/make-contrast-widh-the-background_a4d3d8db-1c0f-4360-b53a-0a1f1ab08c55.png?v=1780411054", price: { amount: "885.95", currencyCode: "USD" } },
    { id: "7", title: "The Videographer Snowboard", url: "/products/the-videographer-snowboard", imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main.jpg?v=1777976348",                                         price: { amount: "885.95", currencyCode: "USD" } },
    { id: "3", title: "The 3p Fulfilled Snowboard", url: "/products/the-3p-fulfilled-snowboard", imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_b9e0da7f-db89-4d41-83f0-7f417b02831d.jpg?v=1777976348",    price: { amount: "2629.95", currencyCode: "USD" } },
  ],
};

const VARIANT_SELECTOR = {
  id: "13", title: "The Complete Snowboard",
  description: "Tavola da snowboard completa, disponibile in 5 colorazioni.",
  images: [
    { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1780334187", altText: "Ice" },
    { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_372ff415-c120-44f1-b534-764c9d5477af.png?v=1780334420", altText: "Dawn" },
    { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/Main_70aa84cc-0fbd-42fc-8bef-00ec1a07f1fb.png?v=1780334518", altText: "Powder" },
  ],
  url: "/products/the-complete-snowboard",
  price: { amount: "699.95", currencyCode: "USD" },
  variants: [
    { id: "61828386226546", title: "Ice",      price: { amount: "699.95" }, available: true  },
    { id: "61828386259314", title: "Dawn",     price: { amount: "699.95" }, available: true  },
    { id: "61828386292082", title: "Powder",   price: { amount: "599.95" }, available: true  },
    { id: "61828386324850", title: "Electric", price: { amount: "699.95" }, available: false },
    { id: "61828386357618", title: "Sunset",   price: { amount: "699.95" }, available: true  },
  ],
  variantLabel: "Colore",
};

const PRODUCTS_3 = [
  { id: "10", title: "Shopify Powder Glide Snowboard Bindings",   url: "/products/shopify-powder-glide-snowboard-bindings",   imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/the-shopify-powder-glide-snowboard-bindings-are-designed-for-deep-snow-enthusiasts-and-backcountry-explorers-who-want-a-surfy-flowing-ride-through-untouched-powder-lightweight-comfort.png?v=1780381685", price: { amount: "219.99", currencyCode: "USD" } },
  { id: "11", title: "Shopify Freestyle Flow Snowboard Bindings", url: "/products/shopify-freestyle-flow-snowboard-bindings", imgUrl: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/the-shopify-freestyle-flow-snowboard-bindings-are-made-for-park-riders-and-jib-enthusiasts-who-need-maximum-flexibility-and-board-feel-soft-playful-and-built-to-take-a-beating-in-the.png?v=1780381038", price: { amount: "189.99", currencyCode: "USD" } },
  {
    id: "12", title: "Shopify Alpine Charge Snowboard Bindings",
    url: "/products/shopify-alpine-charge-snowboard-bindings",
    price: { amount: "249.99", currencyCode: "USD" },
    variants: [
      { id: "61894735233394", title: "Black", price: { amount: "249.99" }, image: { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/the-shopify-alpine-charge-snowboard-bindings-are-engineered-for-aggressive-freeride-and-all-mountain-riders-who-demand-maximum-power-transfer-and-precision-on-steep-terrain-stiff-resp.png?v=1780381280" } },
      { id: "61894735266162", title: "Pink",  price: { amount: "249.99" }, image: { url: "https://cdn.shopify.com/s/files/1/0975/9437/6562/files/the-shopify-alpine-charge-snowboard-bindings-are-engineered-for-aggressive-freeride-and-all-mountain-riders-who-demand-maximum-power-transfer-and-precision-on-steep-terrain-stiff-resp_fe8ac5f3-4688-4234-8249-1065f0a73914.png?v=1780381573" } },
    ],
  },
];

export default function PreviewSection() {
  return (
    <div className="flex flex-col">
      <Section><ProductList products={PRODUCTS_1} /></Section>
      <Section><ProductHero {...SKI_WAX} /></Section>
      <Section><ProductList products={PRODUCTS_2} /></Section>
      <Section><ProductHero {...GIFT_CARD} /></Section>
      <Section><CollectionWidget {...COLLECTION} /></Section>
      <Section><ProductList products={PRODUCTS_3} /></Section>
      <Section><VariantSelector {...VARIANT_SELECTOR} /></Section>
    </div>
  );
}
