export const CART_ID_CHANGED_EVENT = "conversational-storefront:cart-id-changed";

class Cart {
  private id: string | null = null;
  private endpoint: string | null = null;

  init(initialId: string | null, apiUrl?: string) {
    this.id = initialId;
    if (apiUrl) {
      // url assoluto: con apiUrl cross-origin il path relativo punterebbe all'origin del merchant invece che al backend del widget
      const u = new URL(apiUrl, window.location.href);
      this.endpoint = u.origin + u.pathname.replace(/\/$/, "") + "/cart" + u.search;
    }
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
    if (!this.endpoint) return { error: "endpoint carrello non configurato" };
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartId: this.id, variantId, quantity }),
    });
    const result = await res.json().catch(() => ({ error: `risposta non valida (${res.status})` }));
    if (result && typeof result.newCartId === "string") this.applyId(result.newCartId);
    return result;
  }
}

export const cart = new Cart();
