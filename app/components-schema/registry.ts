/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";


// definizione dei nomi dei componenti
export type ComponentName = "ProductCard";

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
    description: "Mostra a schermo un widget di un singolo prodotto. Usalo per mostrare i prodotti restituiti da searchProductTool o per evidenziare un prodotto specifico su cui l'utente ha chiesto informazioni.",
  },
};