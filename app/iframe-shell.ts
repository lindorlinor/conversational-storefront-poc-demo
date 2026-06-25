type IframeShellParams = {
  appOrigin: string;
  apiUrlAttr: string;
};

// si ho importato i font face direttamente solo per poter avere piu varietà nella personalizzazione del tema, a logica si possono vedere solo quelli del proprio store quindi non dovrebbero esserci problemi
export function renderIframeShell({ appOrigin, apiUrlAttr }: IframeShellParams) {
  return `<!DOCTYPE html>
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
}
