import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { SHOP_ID_QUERY } from "./shop.graphql";

export async function getShopId(admin: AdminApiContext): Promise<string> {
  const res = await admin.graphql(SHOP_ID_QUERY);
  const json = await res.json();
  return json.data.shop.id as string;
}
