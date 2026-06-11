const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};


/* crea risposta 204+header cors per le richieste preflight*/
/* nota: fatto specificatamente per usi senza iframe  */
export function corsPreflightResponse(request: Request): Response | null {
  if (request.method !== 'OPTIONS') return null;
  return new Response(null, { 
    status: 204, 
    headers: CORS_HEADERS 
  });
}

/* setta gli header CORS per le risposte. Il browser controlla anche la risposta al preflight */
export function responseWithCors(response: Response): Response {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}
