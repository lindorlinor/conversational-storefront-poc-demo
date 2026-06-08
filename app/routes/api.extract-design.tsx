import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { extract, render } from "designlang/api";
export const action = async ({request}: ActionFunctionArgs) =>{
  await authenticate.admin(request);
  const formData = await request.formData();
  const url = formData.get("url") as string;
  try {
    const design = await extract(url);
    const tokens = render("dtcg", design) as string;
    const formatted = JSON.stringify(JSON.parse(tokens), null, 2);
    return Response.json({ ok: true, tokens: formatted });

  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};

