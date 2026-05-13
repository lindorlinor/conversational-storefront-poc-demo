import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages } from 'ai'
import { createMCPClient } from "@ai-sdk/mcp"
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

const shop = process.env.SHOPIFY_SHOP
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN
const storefrontPassword = process.env.SHOPIFY_STOREFRONT_PASSWORD
export const model = openai('gpt-4o')


let cachedStorefrontCookie: string | null = null


async function passwordAuthenticate(): Promise<Response> {
  return fetch(`https://${shop}.myshopify.com/password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `form_type=storefront_password&utf8=%E2%9C%93&password=${encodeURIComponent(storefrontPassword!)}`,
    redirect: 'manual',
  })
}
async function getStorefrontCookie(): Promise<string | null> {
  if (cachedStorefrontCookie) return cachedStorefrontCookie
  if (!storefrontPassword || !shop) return null

  const response = await passwordAuthenticate()

  const setCookieHeader = response.headers.get('set-cookie')
  const match = setCookieHeader?.match(/_shopify_essential=([^;]+)/)
  if (match) cachedStorefrontCookie = match[1]

  return cachedStorefrontCookie
}

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('[chat loader] called — method:', request.method, 'url:', request.url)
  return new Response(null, { status: 405 })
}

export async function action({ request }: ActionFunctionArgs) {
  console.log('[chat action] called — method:', request.method, 'url:', request.url)
  try {
    const body = await request.json()
    const { messages } = body

    const storefrontCookie = await getStorefrontCookie()
    const mcpHeaders: Record<string, string> = {
      'X-Shopify-Access-Token': accessToken!,
      ...(storefrontCookie ? { Cookie: `_shopify_essential=${storefrontCookie}` } : {}),
    }

    let tools = {}
    try {
      const mcpClientStandard = await createMCPClient({
        transport: {
          type: 'http',
          url: `https://${shop}.myshopify.com/api/mcp`,
          headers: mcpHeaders,
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
