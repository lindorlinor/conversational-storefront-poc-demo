import { tool } from 'ai';
import { searchProductDefinition } from './search-product/definition';
import { searchProductExecute } from './search-product/execute';
import { fetchCollectionDefinition } from './search-product/definition';
import { fetchCollectionExecute } from './search-product/execute';

export const searchProductTool = tool({
  ...searchProductDefinition,
  execute: searchProductExecute,
});

export const fetchCollectionTool = tool({
  ...fetchCollectionDefinition,
  execute: fetchCollectionExecute,
});

