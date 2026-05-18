import type { ActionFunctionArgs } from "react-router";
import { unauthenticated } from "../shopify.server";
import { saveSystemPrompt } from "../system-prompt.graphql";

export async function action({ request }: ActionFunctionArgs) {

  const formData = await request.formData();
  const shop = formData.get("shop") as string;
  const content = formData.get("content") as string;

  const { admin } = await unauthenticated.admin(shop);

  try {
    await saveSystemPrompt(admin, content);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
