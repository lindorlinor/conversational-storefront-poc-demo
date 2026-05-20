import { useState, useEffect } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  const shop = request.headers.get('X-Shopify-Shop-Domain')
    ?? new URL(request.url).searchParams.get('shop')
    ?? '';
  const appUrl = new URL(request.url).origin.replace(/^http:/, 'https:');
  return { shop, appUrl };
}

export default function ChatRoute() {
  const { shop, appUrl } = useLoaderData<typeof loader>();
  const [Client, setClient] = useState<React.ComponentType<{ shop: string; appUrl: string }> | null>(null);

  useEffect(() => {
    import('../chatbot/ChatbotClient').then((m) => setClient(() => m.ChatbotClient));
  }, []);

  if (!Client) return null;
  return (
    <div className="h-screen">
      <Client shop={shop} appUrl={appUrl} />
    </div>
  );
}
