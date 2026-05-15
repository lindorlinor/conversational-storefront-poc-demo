import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import db from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const shop = new URL(request.url).searchParams.get("shop");
  if (!shop) return Response.json({ error: "missing shop" }, { status: 400 });

  const record = await db.systemPrompt.findUnique({ where: { shop } });
  return Response.json({ content: record?.content ?? "" });
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { shop, content } = body as { shop: string; content: string };

  if (!shop || typeof content !== "string") {
    return Response.json({ error: "missing shop or content" }, { status: 400 });
  }

  console.log("[system-prompt] upsert shop:", shop, "content:", content);

  const record = await db.systemPrompt.upsert({
    where: { shop },
    update: { content },
    create: { shop, content },
  });

  console.log("[system-prompt] saved:", record);
  return Response.json({ ok: true });
}
