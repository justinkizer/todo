import { gql, graphql } from 'react-apollo';

export const createTask = graphql(gql`
  mutation createTask($listId: Int!, $body: String!) {
    createTask(listId: $listId, body: $body) {
      id
      body
    }
  }`,
  { name: 'createTaskMutation' }
);

export const updateTask = graphql(gql`
  mutation updateTask($taskId: Int!, $body: String!, $taskOrderNumber: Int!) {
    updateTask(
      taskId: $taskId,
      body: $body,
      taskOrderNumber: $taskOrderNumber
    )
    {
      id
      body
      taskOrderNumber
    }
  }`,
  { name: 'updateTaskMutation' }
);

export const deleteTask = graphql(gql`
  mutation deleteTask($taskId: Int!) {
    deleteTask(taskId: $taskId) {
      id
      body
    }
  }`,
  { name: 'deleteTaskMutation' }
);
