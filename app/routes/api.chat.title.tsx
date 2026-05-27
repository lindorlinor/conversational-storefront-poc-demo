import { LoaderFunctionArgs } from "react-router";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { unauthenticated } from "../shopify.server";
import { getSystemPrompt } from "../shopify/system-prompt.graphql";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const shop = new URL(request.url).searchParams.get("shop") ?? "";
    const { admin } = await unauthenticated.admin(shop);
    const systemPrompt = await getSystemPrompt(admin);

    const { text } = await generateText({
      model: openai("gpt-4.1-nano"),
      system: systemPrompt,
      prompt:
        'Genera un titolo molto corto per la chat dello store. Deve seguire questo pattern ma riformulato in base all\'identità del brand: "chiedimi qualcosa oppure lasciati ispirare". Le parole non devono essere identiche al pattern, solo il senso. Anche l\'ordine può essere diverso.',
    });

    return Response.json({ title: text.replace(/^["«»]+|["«»]+$/g, "").trim() });
  } catch (err) {
    console.error("[api.chat.title] ERROR:", err);
    return Response.json({ title: "Chiedimi qualcosa" }, { status: 200 });
  }
}
