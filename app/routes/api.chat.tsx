import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, stepCountIs } from 'ai'
import { searchProductTool } from '../tools/search-product'
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { unauthenticated } from '../shopify.server';
import { getSystemPrompt } from '../system-prompt.graphql';

export const model = openai('gpt-4.1')
console.log('[chat] model loaded:', model.modelId)

export async function loader({ request }: LoaderFunctionArgs) {
  const appOrigin = new URL(request.url).origin.replace(/^http:/, 'https:');
  const html = `<!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Chat</title>
      </head>
      <body style="margin:0">
        <div id="chat-page-root"></div>
        <script src="https://cdn.shopify.com/shopifycloud/polaris.js" defer></script>
        <script src="${appOrigin}/chat-page.js" defer></script>
      </body>
    </html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const shop = new URL(request.url).searchParams.get('shop') ?? '';
    const { admin } = await unauthenticated.admin(shop);
    const systemPrompt = await getSystemPrompt(admin);
    console.log('[chat action] system prompt:', systemPrompt);

    const body = await request.json()
    const { messages } = body

    const result = streamText({
      system: systemPrompt,
      stopWhen: stepCountIs(3),
      onStepFinish: ({ toolCalls, response }) => {
        if (toolCalls.length > 0) {
          console.log('[chat] tool calls:', JSON.stringify(toolCalls, null, 2))
        }
        const assistantMessages = response.messages.filter(m => m.role === 'assistant')
        if (assistantMessages.length > 0) {
          console.log('[chat] assistant messages:', JSON.stringify(assistantMessages, null, 2))
        }
      },
      model: model,
      tools: { searchProductTool },
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error('[chat] ERROR:', err)
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
