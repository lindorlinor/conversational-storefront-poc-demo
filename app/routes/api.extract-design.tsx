import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({request}: ActionFunctionArgs) =>{
  await authenticate.admin(request);
  const formData = await request.formData();
  const url = formData.get("url") as string;

  return Response.json({ ok: true, url, extracted: { data: "pupu caca" } });
};
