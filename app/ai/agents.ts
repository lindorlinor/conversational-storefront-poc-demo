import { openai } from '@ai-sdk/openai'

// Temporary module declaration to satisfy TypeScript when the 'ai' package
// cannot be resolved in this environment.
declare module 'ai' {
  export function generatedText(opts: any): Promise<any>
}
import { generatedText } from 'ai'

export const model = openai('gpt-4o')

const { text } = await generatedText({
  model: model,
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
})

