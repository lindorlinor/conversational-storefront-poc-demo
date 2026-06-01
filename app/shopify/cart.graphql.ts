export const CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      lines(first: 50) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price { amount currencyCode }
              image { url }
              product {
                title
                handle
              }
            }
          }
        }
      }
      cost {
        totalAmount { amount currencyCode }
      }
    }
  }
`



export const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        cost {
          totalAmount { amount currencyCode }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`