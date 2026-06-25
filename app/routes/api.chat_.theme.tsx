import { LoaderFunctionArgs } from 'react-router';
import { unauthenticated } from '../shopify.server';
import { getThemeConfig, buildThemeCss } from '../shopify/theme.graphql';
import { corsPreflightResponse, responseWithCors } from '../cors.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const preflight = corsPreflightResponse(request);
  if (preflight) return preflight;

  const shop = new URL(request.url).searchParams.get('shop') ?? '';
  let themeCss = '';
  if (shop) {
    try {
      const { admin } = await unauthenticated.admin(shop);
      const config = await getThemeConfig(admin);
      if (config) themeCss = buildThemeCss(config.theme);
    } catch {
      /*  non capisco perchè devo metterci qualcosa per forza*/
    }
  }

  return responseWithCors(
    new Response(themeCss, {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'no-store',
      },
    }),
  );
}
