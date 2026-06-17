import { tool } from 'ai';
import { searchProductDefinition } from './search-product/definition';
import { searchProductExecute } from './search-product/execute';
import { fetchCollectionDefinition } from './fetch-collection/definition';
import { fetchCollectionExecute } from './fetch-collection/execute';
import { searchProductInCollectionDefinition } from './search-product/definition-in-collection';
import { searchProductInCollectionExecute } from './search-product/execute-in-collection';


import { addToCartDefinition } from './cart/definition';
import { addToCartExecute } from './cart/execute';
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


export const addToCartTool = (rawId) => tool({
  ...addToCartDefinition,
  execute: (params) => addToCartExecute({ ...params, rawCartId: rawId }),
});



