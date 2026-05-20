import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { unauthenticated } from '../shopify.server';
import searchProductExecute from '../tools/search-product/execute';

function corsHeaders(request: Request) {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = origin.endsWith('.myshopify.com') ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function action({ request }: ActionFunctionArgs) {
  const headers = corsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  console.log('[api.products] action called, url:', request.url);
  const shop = new URL(request.url).searchParams.get('shop') ?? '';
  console.log('[api.products] shop:', shop);
  const { admin } = await unauthenticated.admin(shop);
  const args = await request.json();
  console.log('[api.products] args:', JSON.stringify(args));
  const result = await searchProductExecute(args);
  console.log('[api.products] result products count:', (result as { products?: unknown[] })?.products?.length);
  return Response.json(result, { headers });
}
