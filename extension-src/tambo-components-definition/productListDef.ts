import { z } from "zod";
import type { TamboComponent } from "@tambo-ai/react";
import { ProductList } from "../components/ProductList";

const ProductListPropsSchema = z.object({
  products: z
    .array(
      z.object({
        id: z.string(),
        handle: z.string(),
        title: z.string(),
        url: z.string(),
        imgUrl: z.string(),
        priceRange: z.object({
          minVariantPrice: z.object({
            amount: z.string(),
            currencyCode: z.string(),
          }),
        }),
        variants: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              price: z.object({ amount: z.string() }),
              image: z.object({ url: z.string() }).optional(),
              url: z.string(),
            })
          )
          .optional(),
      })
    )
    .optional()
    .describe("List of products returned by the search tool"),
});

export const productListDef: TamboComponent = {
  name: "ProductList",
  description:
    "Displays a list of Shopify product cards. Use this after calling searchProducts to show the results. Pass the entire products array from the tool output.",
  component: ProductList,
  propsSchema: ProductListPropsSchema,
};
