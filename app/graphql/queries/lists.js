import { gql, graphql } from 'react-apollo';

export const getLists = graphql(gql`
  query {
    lists {
      id
      title
      listOrderNumber
    }
  }`
);

export const getList = graphql(gql`
  query ($id: Int!) {
    list(id: $id) {
      listOrderNumber
      tasks {
        id
        body
        taskOrderNumber
      }
    }
  }`
);
