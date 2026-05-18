import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { saveSystemPrompt } from "../system-prompt.graphql";

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const content = formData.get("content") as string;

  try {
    await saveSystemPrompt(admin, content);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
