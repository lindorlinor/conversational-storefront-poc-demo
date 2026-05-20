import { z } from "zod";
import type { TamboComponent } from "@tambo-ai/react";
import ProductCard from "../components/ProductCard";

const ProductCardPropsSchema = z.object({
  id: z.string().describe("Unique Shopify product ID"),
  handle: z.string().describe("URL-friendly product slug, e.g. 'classic-t-shirt'"),
  title: z.string().describe("Display name of the product"),
  imgUrl: z.string().describe("URL of the main product image"),
  url: z.string().describe("Full URL to the product page on the storefront"),
  priceRange: z.object({
    minVariantPrice: z.object({
      amount: z.string().describe("Lowest variant price as a numeric string, e.g. '29.99'"),
      currencyCode: z.string().describe("ISO 4217 currency code, e.g. 'EUR'"),
    }),
  }),
  variants: z
    .array(
      z.object({
        id: z.string().describe("Unique variant ID"),
        title: z.string().describe("Variant label, e.g. 'Red / L'"),
        price: z.object({
          amount: z.string().describe("Variant price as a numeric string"),
        }),
        image: z
          .object({ url: z.string().describe("URL of the variant-specific image") })
          .optional(),
        url: z.string().describe("Full URL to this specific variant on the storefront"),
      })
    )
    .optional()
    .describe("List of variants; omit or leave empty if the product has no variants"),
});

export const productCardDef: TamboComponent = {
  name: "ProductCard",
  description:
    "Displays a Shopify product card with image, title, price, and a link to the product page. Use this whenever the user asks to see, find, or buy a product. Render one card per product.",
  component: ProductCard,
  propsSchema: ProductCardPropsSchema,
};
