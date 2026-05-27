import { tool } from 'ai';
import { searchProductDefinition } from './search-product/definition';
import { searchProductExecute } from './search-product/execute';
import { fetchCollectionDefinition } from './fetch-collection/definition';
import { fetchCollectionExecute } from './fetch-collection/execute';

export const searchProductTool = tool({
  ...searchProductDefinition,
  execute: searchProductExecute,
});

export const fetchCollectionTool = tool({
  ...fetchCollectionDefinition,
  execute: fetchCollectionExecute,
});

