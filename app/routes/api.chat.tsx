import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, stepCountIs } from 'ai'
import { searchProductTool, fetchCollectionTool, searchProductInCollectionTool, requestAddToCartTool, requestChangeMarketTool, viewCartTool } from '../tools'
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { unauthenticated } from '../shopify.server';
import { getSystemPrompt } from '../shopify/system-prompt.graphql';
import { corsPreflightResponse, responseWithCors } from '../cors.server';

import {getUItools, buildMerchantUITools}  from '../tools/buildUITools';


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



  // si ho importato i font face direttamente solo per poter avere piu varietà nella personalizzazione del tema, a logica si possono vedere solo quelli del proprio store quindi non dovrebbero esserci problemi
  const html = `<!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Jomolhari&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
        <title>Chat</title>
      </head>
      <body style="margin:0">
        <div id="chat-page-root" data-app-origin="${appOrigin}" data-api-url="${apiUrlAttr}"></div>
        <script src="https://cdn.shopify.com/shopifycloud/polaris.js" defer></script>
        <!-- il bundle è un modulo ES con React external: l'import map fa risolvere
             react/react-dom dei suoi specificatori bare alle copie esm.sh -->
        <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react@18",
              "react-dom": "https://esm.sh/react-dom@18",
              "react-dom/client": "https://esm.sh/react-dom@18/client",
              "react/jsx-runtime": "https://esm.sh/react@18/jsx-runtime"
            }
          }
        </script>
        <script type="module">
          import React from 'react';
          import { createRoot } from 'react-dom/client';
          import { ConversationalStorefront } from '${appOrigin}/widget/conversational-storefront.js';

          var container = document.getElementById('chat-page-root');
          // storefront headless: il parent passa il cartId nell'src dell'iframe
          var params = new URLSearchParams(window.location.search);
          var fromQuery = params.get('cartId');
          // nel caso app proxy questa pagina è same-origin con lo store, quindi
          // document.cookie legge/scrive il cookie cart dello store: qui facciamo
          // da "merchant di riferimento" (issue #79), il widget non tocca cookie
          var m = document.cookie.match(/(?:^|;\\s*)cart=([^;]+)/);
          var cartId = fromQuery || (m ? decodeURIComponent(m[1]) : null);
          var country = params.get('country');
          var language = params.get('language');

          createRoot(container).render(
            React.createElement(ConversationalStorefront, {
              apiUrl: container.dataset.apiUrl,
              cartId: cartId,
              country: country,
              language: language,
            })
          );

          window.addEventListener('conversational-storefront:cart-id-changed', function (e) {
            document.cookie = 'cart=' + encodeURIComponent(e.detail.cartId) + '; path=/; max-age=' + 60 * 60 * 24 * 30;
          });
        </script>
      </body>
    </html>`;
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
      model: openai.chat('gpt-4.1'),
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
