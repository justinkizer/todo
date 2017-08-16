import { gql, graphql } from 'react-apollo';

export const getLists = graphql(gql`
  query {
    lists {
      id
      title
    }
  }`
);

export const getList = graphql(gql`
  query ($id: Int!) {
    list(id: $id) {
      tasks {
        id
        body
        taskOrderNumber
      }
    }
  }`
);
