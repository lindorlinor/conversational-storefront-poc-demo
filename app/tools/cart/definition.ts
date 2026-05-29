import { tool } from 'ai'
import { z } from 'zod'

export const addToCartDefinition = tool({
    description: `Aggiunge un prodotto al carrello. 
        Chiamalo quando l'utente vuole aggiungere un prodotto al carrello.
        Se il prodotto ha variants[], chiedi prima all'utente quale vuole e usa il variantId scelto.
        Se il prodotto ha solo defaultVariantId, usa quello direttamente.
        IMPORTANTE: usa SOLO variantId ottenuti da una ricerca precedente con searchProductTool. 
Non inventare mai variantId. Se non hai ancora cercato il prodotto, cercalo prima.
`,
    inputSchema: z.object({
        variantId: z.string().describe('Il GID completo della variante da aggiungere, es. gid://shopify/ProductVariant/123456789'),
        quantity: z.number().int().min(1).optional().describe('Quantità da aggiungere. Default 1.'),
    }),
})