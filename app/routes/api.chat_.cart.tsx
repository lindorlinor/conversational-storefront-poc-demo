import { ActionFunctionArgs } from 'react-router';
import { addToCartExecute } from '../tools/cart/execute';
import { corsPreflightResponse, responseWithCors } from '../cors.server';

export async function action({ request }: ActionFunctionArgs) {
  const preflight = corsPreflightResponse(request);
  if (preflight) return preflight;

  try {
    const { cartId, variantId, quantity } = await request.json();

    if (typeof variantId !== 'string' || !variantId) {
      return responseWithCors(Response.json({ error: 'variantId mancante' }, { status: 400 }));
    }

    const result = await addToCartExecute({
      rawCartId: typeof cartId === 'string' && cartId ? cartId : null,
      variantId,
      quantity: typeof quantity === 'number' && quantity > 0 ? quantity : 1,
    });

    return responseWithCors(Response.json(result, { status: 'error' in result ? 422 : 200 }));
  } catch (err) {
    console.error('[api.chat.cart] ERROR:', err);
    const message = err instanceof Error ? err.message : String(err);
    return responseWithCors(Response.json({ error: message }, { status: 400 }));
  }
}
