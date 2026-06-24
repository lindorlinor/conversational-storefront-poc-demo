import { tool } from 'ai';
import { z } from 'zod';
import { searchProductDefinition } from './search-product/definition';
import { searchProductExecute } from './search-product/execute';
import { fetchCollectionDefinition } from './fetch-collection/definition';
import { fetchCollectionExecute } from './fetch-collection/execute';
import { searchProductInCollectionDefinition } from './search-product/definition-in-collection';
import { searchProductInCollectionExecute } from './search-product/execute-in-collection';


import { addToCartDefinition } from './cart/definition';
export const searchProductTool = (country, language) => tool({
  ...searchProductDefinition,
  execute: (args) => searchProductExecute(args, { country, language }),
});

export const fetchCollectionTool = tool({
  ...fetchCollectionDefinition,
  execute: fetchCollectionExecute,
});

export const searchProductInCollectionTool = (country, language) => tool({
  ...searchProductInCollectionDefinition,
  execute: (args) => searchProductInCollectionExecute(args, { country, language }),
});


export const requestAddToCartTool = tool({
  ...addToCartDefinition,
  execute: async ({ variantId, quantity = 1 }) => ({ variantId, quantity }),
});


export const changeMarketTool = tool({
  description: 'Call this tool when the user has explicitly confirmed they want to switch to a different market. Do NOT call it to detect language or suggest a switch — use it only after the user has said yes to changing market.',
  inputSchema: z.object({
    isoCode: z.string().optional().describe('ISO 639-1 language code detected from the user input, e.g. "it", "fr", "de"'),
  }),
  execute: async ({ isoCode }) => ({isoCode }),
})



export const viewCartTool = tool({
  description: 'Call this tool when the user wants to view their cart.',
  execute: async () => ({ }),

})


