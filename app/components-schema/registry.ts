/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";


// definizione dei nomi dei componenti
export type ComponentName = "show_product_list" | "show_collection_widget" | "show_product_hero" | "show_variant_selector";

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
    description: "Displays a Shopify collection with its cover image and a product carousel. ONLY call this tool after fetchCollectionTool or searchProductInCollectionTool — products must come from an actual Shopify collection. Do NOT use this to group thematic products: use show_product_list instead."  },
  show_product_hero: {
    schema: z.object({
      id: z.string().optional(),
      handle: z.string().optional(),
      title: z.string().optional(),
      description: z.string().nullable().optional(),
      url: z.string().nullable().optional(),
      imgUrl: z.string().nullable().optional(),
      images: z.array(z.object({
        url: z.string().nullable(),
        altText: z.string().nullable().optional(),
      })).optional().describe("All product images for the gallery carousel."),
      price: z.object({ amount: z.string(), currencyCode: z.string() }).nullable().optional(),
      variants: z.array(z.object({
        id: z.string().optional(),
        title: z.string(),
        price: z.object({ amount: z.string() }).optional(),
        image: z.object({ url: z.string() }).optional(),
      })).optional().describe("Product variants (e.g. size, age group). Pass them so the user can switch between variants interactively."),
      selectedVariantTitle: z.string().optional().describe("Title of the variant to pre-select on load. Use this when the user has expressed a preference for a specific variant (e.g. asked for a product 'for kids' → set this to the matching variant title such as '3-8 years'). Must exactly match one of the titles in the variants array."),
      defaultVariantId: z.string().optional().describe("Variant id used to add the product to the cart when it has no selectable variants. Pass the defaultVariantId returned by the search tool for products without real variants."),
    }),
    description: "Displays a full product hero with image gallery, price and a link to the shop. Use this when the user asks for details about a single specific product. If the product has variants (e.g. sizes, age groups), pass them and set selectedVariantTitle if the user expressed a preference. For products without variants, pass defaultVariantId so the add-to-cart button works.",
  },
  show_variant_selector: {
    schema: z.object({
      title: z.string().optional(),
      description: z.string().nullable().describe("Product description. Pass null if not available — do not invent one."),
      url: z.string().nullable(),
      imgUrl: z.string().nullable().optional(),
      images: z.array(z.object({
        url: z.string().nullable(),
        altText: z.string().nullable(),
      })).optional().describe("Product images for the gallery."),
      price: z.object({ amount: z.string(), currencyCode: z.string() }).nullable().optional(),
      variants: z.array(z.object({
        id: z.string().optional(),
        title: z.string(),
        price: z.object({ amount: z.string() }).optional(),
        image: z.object({ url: z.string() }).optional(),
        available: z.boolean().optional().describe("false if the variant is out of stock — renders with a strikethrough and is not selectable."),
      })).optional().describe("All available variants (e.g. sizes, colors). Mark out-of-stock ones with available: false."),
      variantLabel: z.string().optional().describe("Human-readable name of the variant dimension, in the language of the current market, e.g. 'Taglia', 'Colore', 'Materiale', 'Size', 'Couleur'. This is the product-specific dimension name (it changes per product type), not a fixed UI string. Falls back to a generic 'Variant' label if omitted."),
    }),
    description: "Shows an interactive variant picker that lets the user choose a variant and add the product to the cart. Use this ONLY when the user explicitly asks to add a product to the cart AND there are multiple variants (e.g. sizes) but the user has not specified which one — never use it just to display product details. Set variantLabel to the product-specific dimension name in the language of the current market.",
  },
};



