import type { LoaderFunctionArgs } from "react-router";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { corsPreflightResponse, responseWithCors } from "../cors.server";

// Serve il bundle del widget (public/conversational-storefront.js) con header CORS. Gli asset
// statici di public/ non passano per le route quindi non hanno CORS: ma l'iframe
// dello store (api.chat.tsx) lo importa come modulo ES cross-origin, e i module
// import — a differenza dei classic <script src> — sono soggetti a CORS.
export async function loader({ request }: LoaderFunctionArgs) {
  const preflight = corsPreflightResponse(request);
  if (preflight) return preflight;

  const filePath = path.resolve(process.cwd(), "public/conversational-storefront.js");
  const js = await readFile(filePath, "utf8");

  return responseWithCors(
    new Response(js, {
      headers: {
        "Content-Type": "text/javascript; charset=utf-8",
        // bundle prebuildato e versionato: cache breve, niente revalidate aggressivo
        "Cache-Control": "public, max-age=300",
      },
    }),
  );
}
