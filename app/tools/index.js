import { tool } from 'ai';
import { searchProductDefinition } from './search-product/definition';
import { searchProductExecute } from './search-product/execute';
import { fetchCollectionDefinition } from './fetch-collection/definition';
import { fetchCollectionExecute } from './fetch-collection/execute';
import { searchProductInCollectionDefinition } from './search-product/definition-in-collection';
import { searchProductInCollectionExecute } from './search-product/execute-in-collection';

export const searchProductTool = tool({
  ...searchProductDefinition,
  execute: searchProductExecute,
});

export const fetchCollectionTool = tool({
  ...fetchCollectionDefinition,
  execute: fetchCollectionExecute,
});

export const searchProductInCollectionTool = tool({
  ...searchProductInCollectionDefinition,
  execute: searchProductInCollectionExecute,
});

