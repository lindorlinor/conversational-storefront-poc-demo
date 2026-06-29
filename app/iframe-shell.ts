type IframeShellParams = {
  appOrigin: string;
  apiUrlAttr: string;
};

export function renderIframeShell({ appOrigin, apiUrlAttr }: IframeShellParams) {
  return `<!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Chat</title>
      </head>
      <body style="margin:0">
        <div id="chat-page-root" data-app-origin="${appOrigin}" data-api-url="${apiUrlAttr}"></div>
        <script src="https://cdn.shopify.com/shopifycloud/polaris.js" defer></script>
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

          var pendingAddToCart = {};
          window.addEventListener('message', function (e) {
            var data = e.data;
            if (!data || data.type !== 'conversational-storefront:add-to-cart-result') return;
            var resolve = pendingAddToCart[data.requestId];
            if (!resolve) return;
            delete pendingAddToCart[data.requestId];
            resolve(data.result);
          });

          function onAddToCart(variantId, quantity) {
            return new Promise(function (resolve) {
              var requestId = String(Date.now()) + '-' + Math.random().toString(36).slice(2);
              pendingAddToCart[requestId] = resolve;
              setTimeout(function () {
                if (pendingAddToCart[requestId]) {
                  delete pendingAddToCart[requestId];
                  resolve({ success: false, reason: 'nessuna risposta dal negozio' });
                }
              }, 15000);
              window.parent.postMessage({
                type: 'conversational-storefront:add-to-cart',
                requestId: requestId,
                variantId: variantId,
                quantity: quantity,
              }, '*');
            });
          }

          // chiusura del widget: l'iframe non controlla il dialog del tema,
          // segnala al parent che chiude il <dialog> che ci contiene
          function onClose() {
            window.parent.postMessage({ type: 'conversational-storefront:close' }, '*');
          }

          createRoot(container).render(
            React.createElement(ConversationalStorefront, {
              apiUrl: container.dataset.apiUrl,
              cartId: cartId,
              country: country,
              language: language,
              onAddToCart: onAddToCart,
              onClose: onClose,
            })
          );
        </script>
      </body>
    </html>`;
}
