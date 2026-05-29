import { tool } from 'ai'
import { z } from 'zod'

export const addToCartDefinition = tool({
    description: 'Aggiunge un prodotto hardcodato al carrello. Chiamalo quando l\'utente dice di voler aggiungere qualcosa al carrello.',
    inputSchema: z.object({}),
})