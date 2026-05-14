import { tool } from 'ai';
import { searchProductDefinition } from './definition';
import { searchProductExecute } from './execute';

export const searchProductTool = tool({
  ...searchProductDefinition,
  execute: searchProductExecute,
});
