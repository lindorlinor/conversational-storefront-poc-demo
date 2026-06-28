export const LIST_PROMPTS_QUERY = `#graphql
  query listPrompts($type: String!) {
    metaobjects(type: $type, first: 50) {
      nodes {
        id
        handle
        updatedAt
        content: field(key: "content") { value }
      }
    }
  }`;

export const ACTIVE_PROMPT_QUERY = `#graphql
  query activePrompt($namespace: String!, $key: String!) {
    shop {
      metafield(namespace: $namespace, key: $key) { value }
    }
  }`;

export const CREATE_PROMPT_MUTATION = `#graphql
  mutation createPrompt($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id }
      userErrors { field message }
    }
  }`;

export const UPDATE_PROMPT_MUTATION = `#graphql
  mutation updatePrompt($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject { id }
      userErrors { field message }
    }
  }`;
