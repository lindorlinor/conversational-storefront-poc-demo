import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages } from 'ai'
import { createMCPClient } from "@ai-sdk/mcp"
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

const shop = process.env.SHOPIFY_SHOP
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

    let tools = {}
    try {
      const mcpClientStandard = await createMCPClient({
        transport: {
          type: 'http',
          url: `https://${shop}.myshopify.com/api/mcp`,
        },
      })
      tools = await mcpClientStandard.tools()
      console.log('[chat] MCP tools loaded:', Object.keys(tools).join(', '))
    } catch (mcpErr) {
      console.warn('[chat] MCP unavailable, continuing without tools:', mcpErr instanceof Error ? mcpErr.message : mcpErr)
    }

    const result = streamText({
      model: model,
      tools,
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
