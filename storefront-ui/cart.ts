import { addToCartExecute } from "./utils/utils";


export const CART_ID_CHANGED_EVENT = "conversational-storefront:cart-id-changed";

class Cart {
  private id: string | null = null;

  init(initialId: string | null) {
    this.id = initialId;
  }

  getId(): string | null {
    return this.id;
  }

  applyId(id: string) {
    if (!id || id === this.id) return;
    this.id = id;
    // se non in un iframe
    window.dispatchEvent(new CustomEvent(CART_ID_CHANGED_EVENT, { detail: { cartId: id } }));
    // se in un iframe
    if (window.parent !== window) {
      window.parent.postMessage({ type: CART_ID_CHANGED_EVENT, cartId: id }, "*");
    }
  }

  async addLine(variantId: string, quantity = 1) {
    const result = await addToCartExecute({ rawCartId: this.id, variantId, quantity });
    if ("newCartId" in result && result.newCartId) this.applyId(result.newCartId);
    return result;
  }
}

export const cart = new Cart();
