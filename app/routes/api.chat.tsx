import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, stepCountIs } from 'ai'
import { searchProductTool } from '../tools/search-product'
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

export const model = openai('gpt-4o')

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('[chat loader] called — method:', request.method, 'url:', request.url)
  return new Response(null, { status: 405 })
}

export async function action({ request }: ActionFunctionArgs) {
  console.log('[chat action] called — method:', request.method, 'url:', request.url)
  try {
    const body = await request.json()
    const { messages } = body

    const result = streamText({
      system: `Sei un assistente per uno store di snowboard ma anche di altro.
          I prodotti possono avere metafield personalizzati (namespace: "custom"):
          - key: "livello_rider_parte_2" — livello di difficoltà del prodotto (es. "prova1" o "prova2")

          Quando l'utente cerca per caratteristiche che corrispondono a un metafield noto, usa metafield_filters oltre alla query testuale.
          Se una ricerca non produce risultati, riprova usando un approccio diverso (es. solo metafield, o senza filtri di prezzo).

          I prodotti sono in inglese quindi fai la ricerca in inglese anche se l'utente scrive in un altro idioma. Rispondi sempre nella lingua in cui scrive l'utente.
          IMPORTANTE: se hai chiamato searchProductTool e hai ottenuto prodotti, NON aggiungere testo descrittivo sui prodotti trovati. I prodotti vengono già mostrati visivamente all'utente. Rispondi solo in testo se non hai trovato nulla o se l'utente fa una domanda che non richiede una ricerca.

          Regole per searchProductTool:
          - NON includere priceRange nei filtri se l'utente non ha menzionato un prezzo o budget specifico.
          - NON includere availability nei filtri se l'utente non ha chiesto esplicitamente prodotti disponibili o non disponibili.
          - NON includere categories se l'utente non ha menzionato una categoria specifica.
          - Se l'utente scrive solo il nome di un prodotto (es. "wax"), usa solo il campo query e non aggiungere nessun filtro.`,
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
