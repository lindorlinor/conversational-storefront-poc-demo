export const SHOP_ID_QUERY = `#graphql
  query { shop { id } }`;

export const SET_SHOP_METAFIELD_MUTATION = `#graphql
  mutation setShopMetafield($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      userErrors { field message }
    }
  }`;
