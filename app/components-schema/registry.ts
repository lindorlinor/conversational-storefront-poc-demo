/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";


// definizione dei nomi dei componenti
export type ComponentName = "ProductCard" | "ProductList";

type ComponentSchema =  {
    schema: z.ZodObject<any>;
    description: string;
}

export const registry: Record<ComponentName, ComponentSchema> = {
  ProductCard: {
    schema: z.object({
      id: z.string(),
      handle: z.string(),
      title: z.string(),
      imgUrl: z.string(),
      url: z.string(),
      priceRange: z.object({
        minVariantPrice: z.object({
          amount: z.string(),
          currencyCode: z.string(),
        }),
      }),
      variants: z.array(z.object({
        id: z.string(),
        title: z.string(),
        price: z.object({ amount: z.string() }),
        image: z.object({ url: z.string() }).optional(),
        url: z.string(),
      })).optional(),
    }),
    description: "Mostra a schermo un widget di un singolo prodotto.",
  },
  ProductList: {
    schema: z.object({
      products: z.array(z.object({
        id: z.string(),
        handle: z.string(),
        title: z.string(),
        url: z.string(),
        imgUrl: z.string(),
        priceRange: z.object({
          minVariantPrice: z.object({ amount: z.string(), currencyCode: z.string() }),
        }),
        variants: z.array(z.object({
          id: z.string(),
          title: z.string(),
          price: z.object({ amount: z.string() }),
          image: z.object({ url: z.string() }).optional(),
          url: z.string(),
        })).optional(),
      })).optional(),
    }),
    description: "Displays a list of Shopify product cards. Use this after calling searchProductsTool to show the results. Pass the entire products array from the tool output.",
  },
};



