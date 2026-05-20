import { useMemo } from 'react';
import "@/index.css";
import { TamboProvider } from '@tambo-ai/react';
import { MessageThreadFull } from '@/components/tambo/message-thread-full';
import { createSearchProductTool } from './tambo/searchProductTool';
import { productListDef } from './tambo/productListDef';

export function ChatbotClient({ shop, appUrl }: { shop: string; appUrl: string }) {
  const tools = useMemo(
    () => [createSearchProductTool(shop, appUrl)],
    [shop, appUrl]
  );

  return (
    <TamboProvider
      apiKey={import.meta.env.VITE_TAMBO_API_KEY}
      userKey="user-1"
      tools={tools}
      components={[productListDef]}
    >
      <MessageThreadFull />
    </TamboProvider>
  );
}
