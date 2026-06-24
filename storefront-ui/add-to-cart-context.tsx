import { createContext, useContext } from "react";

export type AddToCartResult =
  | { success: true; totalQuantity?: number }
  | { success: false; reason: string };

export type AddToCartRequest = (
  variantId: string,
  quantity: number,
) => Promise<AddToCartResult>;


const AddToCartContext = createContext<AddToCartRequest | undefined>(undefined);

export const AddToCartProvider = AddToCartContext.Provider;

export function useAddToCart(): AddToCartRequest | undefined {
  return useContext(AddToCartContext);
}
