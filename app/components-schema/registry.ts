/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";


// definizione dei nomi dei componenti
export type ComponentName = "show_product_list" | "show_collection_widget" | "show_product_hero";

type ComponentSchema =  {
    schema: z.ZodObject<any>;
    description: string;
}

export const registry: Record<ComponentName, ComponentSchema> = {
  show_product_list: {
    schema: z.object({
      products: z.array(z.object({
        id: z.string(),
        handle: z.string(),
        title: z.string(),
        url: z.string(),
        imgUrl: z.string().nullable().describe("l'url dell'immagine potrebbe non essere presente per alcuni prodotti"),
        price: z.object({ amount: z.string(), currencyCode: z.string() }).nullable(),
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
  show_collection_widget: {
    schema: z.object({
      title: z.string().describe("Nome della collezione"),
      description: z.string().describe("Breve descrizione della collezione"),
      coverImageUrl: z.string().optional().describe("URL dell'immagine di copertina della collezione. Omit if not available — the widget renders fine without it."),
      products: z.array(z.object({
        id: z.string().optional(),
        handle: z.string().optional(),
        title: z.string().optional(),
        url: z.string().optional(),
        imgUrl: z.string().nullable().optional(),
        price: z.object({ amount: z.string(), currencyCode: z.string() }).nullable().optional(),
      })).optional().describe("Prodotti da mostrare nel carosello"),
    }),
    description: "Displays a collection section with an optional cover image and a product carousel. Always use this to present a collection — coverImageUrl is optional and can be omitted if not available.",
  },
  show_product_hero: {
    schema: z.object({
      id: z.string().optional(),
      handle: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      url: z.string().optional(),
      imgUrl: z.string().nullable().optional(),
      images: z.array(z.object({
        url: z.string(),
        altText: z.string().optional(),
      })).optional().describe("All product images for the gallery carousel."),
      price: z.object({ amount: z.string(), currencyCode: z.string() }).nullable().optional(),
    }),
    description: "Displays a full product hero with image gallery, price and a link to the shop. Use this when the user asks for details about a single specific product.",
  },
};



