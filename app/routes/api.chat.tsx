import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, stepCountIs } from 'ai'
import { searchProductTool, fetchCollectionTool, searchProductInCollectionTool } from '../tools'
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { unauthenticated } from '../shopify.server';
import { getSystemPrompt } from '../shopify/system-prompt.graphql';

import {getUItools}  from '../tools/buildUITools';
export const model = openai('gpt-4.1')
// console.log('[chat] model loaded:', model.modelId)

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
        <div id="chat-page-root" data-app-origin="${appOrigin}"></div>
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
    // console.log('[chat action] system prompt:', systemPrompt);

    const body = await request.json()
    const { messages } = body

    const t0 = Date.now()
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    const rawContent = lastUserMessage?.content
    const userText = typeof rawContent === 'string'
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent.find((p: { type: string }) => p.type === 'text')?.text ?? JSON.stringify(rawContent)
        : lastUserMessage?.parts?.find((p: { type: string }) => p.type === 'text')?.text ?? '(unknown)'
    console.log(`\n[0] USER: "${userText}"`)

    let searchToolEndTime: number | null = t0
    const productCardStreamStart: number[] = []
    const productListStreamStart: number[] = []

    const result = streamText({
      system: systemPrompt,
      stopWhen: stepCountIs(3),
      onChunk: ({ chunk }) => {
        const c = chunk as { type: string; toolName?: string; toolCallId?: string }
        if (c.type === 'tool-input-start' && c.toolName === 'searchProductTool') {
          console.log(`[0→1] searchProductTool: CHIAMATO — ${Date.now() - t0}ms dopo la domanda (1° LLM TTFT)`)
        }
        if (c.type === 'tool-result' && c.toolName === 'searchProductTool') {
          searchToolEndTime = Date.now()
        }
        if (c.type === 'tool-input-start' && c.toolName === 'ProductCard') {
          const decisionMs = searchToolEndTime ? Date.now() - searchToolEndTime : -1
          productCardStreamStart.push(Date.now())
          console.log(`\n[3] ProductCard: STREAMING START — model decision time: ${decisionMs}ms`)
        }
        if (c.type === 'tool-result' && c.toolName === 'ProductCard') {
          const start = productCardStreamStart.shift()
          const fillMs = start ? Date.now() - start : -1
          console.log(`[4] ProductCard: SCHEMA COMPLETE — schema fill time: ${fillMs}ms`)
        }
        if (c.type === 'tool-input-start' && c.toolName === 'ProductList') {
          const decisionMs = searchToolEndTime ? Date.now() - searchToolEndTime : -1
          productListStreamStart.push(Date.now())
          console.log(`\n[3] ProductList: STREAMING START — model decision time: ${decisionMs}ms`)
        }
        if (c.type === 'tool-result' && c.toolName === 'ProductList') {
          const start = productListStreamStart.shift()
          const fillMs = start ? Date.now() - start : -1
          console.log(`[4] ProductList: SCHEMA COMPLETE — schema fill time: ${fillMs}ms`)
        }
      },
      onStepFinish: ({ toolCalls, response }) => {
        if (toolCalls.length > 0) {
          // console.log('[chat] tool calls:', JSON.stringify(toolCalls, null, 2))
        }
        const assistantMessages = response.messages.filter(m => m.role === 'assistant')
        if (assistantMessages.length > 0) {
          // console.log('[chat] assistant messages:', JSON.stringify(assistantMessages, null, 2))
        }
      },
      model: model,
      tools: { searchProductTool, fetchCollectionTool, searchProductInCollectionTool, ...getUItools() },
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
