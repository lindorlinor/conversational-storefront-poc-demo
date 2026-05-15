import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, stepCountIs } from 'ai'
import { searchProductTool } from '../tools/search-product'
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

export const model = openai('gpt-4.1')
console.log('[chat] model loaded:', model.modelId)

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
      system: `Sei un assistente per uno store principalmente di snowboard (se ti viene chiesto cosa altro vendi, rispondi solo se ne sei a conoscenza)
          
I prodotti possono avere metafield personalizzati (namespace: "custom"):
- key: "livello_rider_parte_2" — livello di difficoltà del prodotto (es. "prova1" o "prova2")

Quando l'utente cerca per caratteristiche che corrispondono a un metafield noto, usa metafield_filters oltre alla query testuale.
Se una ricerca non produce risultati, riprova usando un approccio diverso (es. solo metafield, o senza filtri di prezzo).

IMPORTANTE: I prodotti sono in inglese quindi fai la ricerca in inglese anche se l'utente scrive in un altro idioma. Rispondi sempre nella lingua in cui scrive l'utente.
IMPORTANTE: se hai chiamato searchProductTool e hai ottenuto prodotti, NON aggiungere testo descrittivo sui prodotti trovati. I prodotti vengono già mostrati visivamente all'utente. Rispondi solo in testo se non hai trovato nulla o se l'utente fa una domanda che non richiede una ricerca.

Comprensione dell'intento dell'utente:
- Interpreta le parole dell'utente in modo letterale, senza fare assunzioni sul loro significato.
- Se una parola potrebbe essere sia un nome proprio (nome di un prodotto) sia un termine generico, trattala come nome di prodotto.
- Traduci i termini generici nella lingua dei prodotti dello store, ma se l'utente usa un nome proprio o un termine specifico che sembra essere il nome di un prodotto, cercalo letteralmente senza tradurlo.

`
          
          ,
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
