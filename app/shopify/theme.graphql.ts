export const LIST_THEMES_QUERY = `#graphql
  query listThemes($type: String!) {
    metaobjects(type: $type, first: 50, query: "status:active") {
      nodes {
        id
        handle
        updatedAt
        theme_config: field(key: "theme_config") { value }
      }
    }
  }`;

export const ACTIVE_THEME_QUERY = `#graphql
  query activeTheme($namespace: String!, $key: String!) {
    shop {
      metafield(namespace: $namespace, key: $key) { value }
    }
  }`;

export const CREATE_THEME_MUTATION = `#graphql
  mutation createTheme($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id }
      userErrors { field message }
    }
  }`;

export const UPDATE_THEME_MUTATION = `#graphql
  mutation updateTheme($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject { id }
      userErrors { field message }
    }
  }`;
