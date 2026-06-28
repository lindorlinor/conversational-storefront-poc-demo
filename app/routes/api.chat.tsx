import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, stepCountIs } from 'ai'
import { searchProductTool, fetchCollectionTool, searchProductInCollectionTool, fetchEditorialTool, requestAddToCartTool, requestChangeMarketTool, viewCartTool } from '../tools'
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { unauthenticated } from '../shopify.server';
import { getSystemPrompt } from '../shopify/system-prompt.server';
import { corsPreflightResponse, responseWithCors } from '../cors.server';

import {getUItools, buildMerchantUITools}  from '../tools/buildUITools';
import { renderIframeShell } from '../iframe-shell';


export async function loader({ request }: LoaderFunctionArgs) {

  const preflight = corsPreflightResponse(request);
  /* se è una richiesta preflight (riconosciuta solo dal campo method=OPTIONS) allora ritorna la response con gli header CORS, la response poi arriva al browser che può continuare */
  if (preflight) return preflight;
  
  const url = new URL(request.url);
  const appOrigin = url.origin.replace(/^http:/, 'https:');
  const shop = url.searchParams.get('shop') ?? '';

  // se la richiesta arriva dall'app proxy Shopify aggiunge path_prefix e il
  // widget può usare il default /apps/chatbot; in accesso diretto (tunnel,
  // iframe dello storefront headless) l'endpoint è la route /api/chat
  const isProxied = url.searchParams.has('path_prefix');
  // nel caso proxy l'URL resta pulito: Shopify aggiunge shop, timestamp e
  // signature a ogni richiesta inoltrata, rigiocare quelli del primo load
  // invalida la firma
  const apiUrl = isProxied
    ? '/apps/chatbot'
    : `/api/chat?shop=${encodeURIComponent(shop)}`;
  const apiUrlAttr = apiUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const html = renderIframeShell({ appOrigin, apiUrlAttr });
  // senza questo header Shopify applica "frame-ancestors 'none'" alle risposte
  // dell'app proxy e il widget non può essere embeddato in un iframe
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      // admin.shopify.com serve per l'anteprima nell'editor del tema, dove lo
      // store è a sua volta dentro un iframe dell'admin
      "Content-Security-Policy": `frame-ancestors 'self' http://localhost:* https://*.myshopify.com https://admin.shopify.com`,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  
  const preflight = corsPreflightResponse(request);
  /* se è una richiesta preflight (riconosciuta solo dal campo method=OPTIONS) allora ritorna la response con gli header CORS, la response poi arriva al browser che può continuare */
  if (preflight) return preflight;


  try {

    const shop = new URL(request.url).searchParams.get('shop') ?? '';
    const { admin } = await unauthenticated.admin(shop);
    const systemPrompt = await getSystemPrompt(admin);
    console.log('[chat action] system prompt:', systemPrompt);

    const body = await request.json()
    const { messages, cartId, componentSchemas, country, language } = body
    console.log('[cart] cartId dal body:', cartId)

    // cosa ha mandato il merchant via init({ components }): nomi + schemi
    console.log(
      '[merchant] componentSchemas ricevuti:',
      componentSchemas ? Object.keys(componentSchemas) : '(nessuno)',
    )
    if (componentSchemas) {
      console.log('[merchant] schemi:', JSON.stringify(componentSchemas, null, 2))
    }

    const t0 = Date.now()
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    const rawContent = lastUserMessage?.content
    const userText = typeof rawContent === 'string'
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent.find((p: { type: string }) => p.type === 'text')?.text ?? JSON.stringify(rawContent)
        : lastUserMessage?.parts?.find((p: { type: string }) => p.type === 'text')?.text ?? '(unknown)'
    console.log(`\n[0] USER: "${userText}"`)

    // i tool del merchant vanno per ultimi: stesso nome => override del default
    const merchantTools = buildMerchantUITools(componentSchemas)
    const tools = {
      searchProductTool: searchProductTool(country, language),
      fetchCollectionTool,
      searchProductInCollectionTool: searchProductInCollectionTool(country, language),
      fetchEditorialTool: fetchEditorialTool(country, language),
      requestAddToCartTool,
      ...getUItools(),
      ...merchantTools,
      requestChangeMarketTool,
      viewCartTool
    }
    const toolNames = Object.keys(tools)
    const merchantNames = Object.keys(merchantTools)
    console.log(`[tools] creati ${toolNames.length} tool:`, toolNames)
    console.log('[tools] dal merchant:', merchantNames.length ? merchantNames : '(nessuno)')

    const marketContext = `Current market: country=${country ?? 'unknown'}, language=${language ?? 'unknown'}.`;

    const result = streamText({
      system: `${marketContext}\n\n${systemPrompt}`,
      stopWhen: stepCountIs(12),
      maxRetries: 5,
      providerOptions: {
        openai: { parallelToolCalls: false },
      },
      onChunk: ({ chunk }) => {
        /* ho procrastinato l'accorpamento della logica per 3 settimane come minimo */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = chunk as any
        switch (c.type) {
          // il modello ha deciso di chiamare un tool: vedo subito QUALE
          case 'tool-input-start':
            console.log(`\n[tool-call] → ${c.toolName} (+${Date.now() - t0}ms)`)
            break
          // input completo del tool (cosa ci ha messo dentro il modello)
          case 'tool-call':
            console.log(`[tool-call] ${c.toolName} input:`, JSON.stringify(c.input ?? c.args))
            break
          // risultato del tool (solo presenza, l'output può essere enorme)
          case 'tool-result':
            console.log(`[tool-result] ← ${c.toolName}`)
            break
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
      model: openai.chat('gpt-5-mini-2025-08-07'),
      tools,
      messages: await convertToModelMessages(messages),
    })

    return responseWithCors(result.toUIMessageStreamResponse())
  } catch (err) {
    console.error('[chat] ERROR:', err)
    const message = err instanceof Error ? err.message : String(err)
    return responseWithCors(new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }))
  }
}
