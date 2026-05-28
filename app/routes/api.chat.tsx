import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, stepCountIs, wrapLanguageModel, type LanguageModelMiddleware } from 'ai'
import { searchProductTool, fetchCollectionTool, searchProductInCollectionTool } from '../tools'
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { unauthenticated } from '../shopify.server';
import { getSystemPrompt } from '../shopify/system-prompt.graphql';

import {getUItools}  from '../tools/buildUITools';

function parseRetryAfterMs(err: unknown): number | null {
  const haystack = typeof err === 'string' ? err : JSON.stringify(err)
  const match = haystack.match(/try again in (\d+(?:\.\d+)?)s/i)
  return match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : null
}

const rateLimitRetryMiddleware: LanguageModelMiddleware = {
  specificationVersion: 'v3',
  wrapStream: async ({ doStream }) => {
    for (let attempt = 0; attempt < 6; attempt++) {
      const result = await doStream()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reader = (result.stream as ReadableStream<any>).getReader()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buffered: any[] = []
      let rateLimitMsg: string | null = null

      // Read until we get real content or an error (stream-start is just a header)
      let keepReading = true
      while (keepReading) {
        let done: boolean, chunk: unknown
        try {
          const read = await reader.read()
          done = read.done
          chunk = read.value
        } catch (readErr: unknown) {
          const msg: string = (readErr as { message?: string })?.message ?? ''
          console.log('[middleware] stream read threw:', msg.slice(0, 150))
          if (msg.includes('rate_limit_exceeded')) rateLimitMsg = msg
          else throw readErr
          keepReading = false
          break
        }
        if (done) { keepReading = false; break }
        const c = chunk as { type?: string; error?: { message?: string }; message?: string }
        buffered.push(c)
        if (c?.type === 'stream-start' || c?.type === 'response-metadata') continue
        console.log('[middleware] non-header chunk type:', c?.type, JSON.stringify(c).slice(0, 150))
        if (c?.type === 'error') {
          const errorJson = JSON.stringify(c)
          if (errorJson.includes('rate_limit_exceeded')) rateLimitMsg = errorJson
        }
        keepReading = false
      }

      if (rateLimitMsg !== null) {
        reader.cancel()
        const waitMs = parseRetryAfterMs({ message: rateLimitMsg }) ?? Math.min(2000 * Math.pow(2, attempt), 32000)
        console.log(`[rate limit stream] retry ${attempt + 1}/5 — waiting ${waitMs}ms`)
        await new Promise(resolve => setTimeout(resolve, waitMs))
        continue
      }

      // no rate limit — rebuild stream prepending buffered chunks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newStream = new ReadableStream<any>({
        start(controller) { for (const c of buffered) controller.enqueue(c) },
        async pull(controller) {
          const { done, value } = await reader.read()
          if (done) controller.close()
          else controller.enqueue(value)
        },
        cancel() { reader.cancel() },
      })

      return { ...result, stream: newStream }
    }
    throw new Error('rate limit: max retries exceeded')
  },
}


//modello con middleware per errori rate limit (con il 5 mini difficile ma è lo tengo comunque, magari in futuro può servire per altri modelli)
export const model = wrapLanguageModel({
  model: openai('gpt-5-mini-2025-08-07'),
  middleware: rateLimitRetryMiddleware,
})

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
      stopWhen: stepCountIs(12),
      maxRetries: 5,
      providerOptions: {
        openai: { parallelToolCalls: false },
      },
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
        if (c.type === 'tool-input-start' && c.toolName === 'CollectionWidget') {
          const decisionMs = searchToolEndTime ? Date.now() - searchToolEndTime : -1
          console.log(`\n[3] CollectionWidget: STREAMING START — model decision time: ${decisionMs}ms`)
        }
        if (c.type === 'tool-result' && c.toolName === 'CollectionWidget') {
          console.log(`[4] CollectionWidget: SCHEMA COMPLETE`)
        }
        if (c.type === 'tool-input-start' && c.toolName === 'ProductHero') {
          const decisionMs = searchToolEndTime ? Date.now() - searchToolEndTime : -1
          console.log(`\n[3] ProductHero: STREAMING START — model decision time: ${decisionMs}ms`)
        }
        if (c.type === 'tool-result' && c.toolName === 'ProductHero') {
          console.log(`[4] ProductHero: SCHEMA COMPLETE`)
        }
      },
      onFinish: ({ usage }) => {
        console.log(`\n📊 token usage — input: ${usage.inputTokens}, output: ${usage.outputTokens}, total: ${(usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)}`)
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
