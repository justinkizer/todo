import { gql, graphql } from 'react-apollo';

export const createList = graphql(gql`
  mutation createList($title: String!) {
    createList(title: $title) {
      id
      title
    }
  }`,
  { name: 'createListMutation' }
);

export const updateList = graphql(gql`
  mutation updateList($listId: Int!, $title: String!) {
    updateList(listId: $listId, title: $title) {
      id
      title
    }
  }`,
  { name: 'updateListMutation' }
);

export const deleteList = graphql(gql`
  mutation deleteList($listId: Int!) {
    deleteList(listId: $listId) {
      id
      title
    }
  }`,
  { name: 'deleteListMutation' }
);
