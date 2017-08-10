import React from 'react';
import { gql, graphql, compose } from 'react-apollo';

class ListModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: this.props.selectedList.title, body: '' };
  }

  componentWillReceiveProps(newProps) {
    this.setState({ title: newProps.selectedList.title });
  }

  update(id, updateType) {
    return e => {
      if (updateType === 'task') {
        this.setState({ [id]: { body: e.target.value }});
      } else if (updateType === 'list') {
        this.setState({ title: e.target.value });
      } else {
        this.setState({ body: e.target.value });
      }
    };
  }

  handleCreateTask(e) {
    e.preventDefault();
    this.props.createTaskMutation({
      variables: {
        listId: this.props.id,
        body: this.state.body
      }
    })
      .then(() => {
        this.setState({ body: '' });
        this.props.data.refetch();
      });
  }

  handleUpdate(taskId, updateType) {
    return e => {
      e.preventDefault();
      if (updateType === 'task') {
        this.props.updateTaskMutation({
          variables: {
            taskId: taskId,
            body: this.state[taskId].body
          }
        })
          .then(() => {
            document.activeElement.blur();
          });
      } else {
        document.getElementById('list_name').disabled=true;
        this.props.updateListMutation({
          variables: {
            listId: this.props.id,
            title: this.state.title
          }
        })
          .then(() => {
            this.props.updateParent({
              selectedList: {
                id: this.props.id,
                title: this.state.title
              }
            });
            document.activeElement.blur();
          });
      }
    };
  }

  handleDelete(taskId) {
    this.props.deleteTaskMutation({
      variables: { taskId: taskId }
    })
      .then(() => {
        this.props.data.refetch();
      });
  }

  render() {
    if (this.props.data.loading) { return null; }
    if (this.props.data.error) {
      return (<strong>{ this.props.data.error.message }</strong>);
    }

    return (
      <ul className='tasks-nav'>
        <li className='list-name'>
          <form onSubmit={ this.handleUpdate(this.props.id, 'list') }>
            <input id='list_name'
                   disabled
                   onChange={ this.update(this.props.id, 'list').bind(this) }
                   onFocus={ () => this.setState({
                     title: this.props.selectedList.title
                   })}
                   onBlur={ this.handleUpdate(this.props.id, 'list') }
                   value={ this.state.title }>
            </input>
          </form>
          <strong onClick={() => {
            document.getElementById('list_name').disabled=false;
            document.getElementById('list_name').focus();
          }}>
            ✎
          </strong>
        </li>
        <button className='close-modal-button'
                onClick={ () => this.props.updateParent({
                  modalVisible: false
                })}
        >
          <strong>X</strong>
        </button>
        <li key={ 'newTask' }>
          <form onSubmit={ this.handleCreateTask.bind(this) }
                className='task-create-item-form'
          >
            <input onChange={ this.update().bind(this) }
                   placeholder='Create a New Task Here'
                   value={ this.state.body }
            >
            </input>
            <button className='add-button' type='submit'>
              <strong>✔</strong>
            </button>
          </form>
        </li>
        { [...this.props.data.list.tasks].sort((x, y) => {
            return x.id - y.id;
          })
            .map(task => {
              let value;
              if (this.state[task.id]) {
                value = this.state[task.id].body;
              } else {
                value = task.body;
              }
              return (<li key={ task.id }>
                <form onSubmit={ this.handleUpdate(task.id, 'task') }
                      className='task-item-form'
                >
                  <input type='text'
                         onChange={ this.update(task.id, 'task').bind(this) }
                         onBlur={ this.handleUpdate(task.id, 'task') }
                         onFocus={ () => this.setState({
                           [task.id]: { body: task.body }
                         })}
                         value={ value }
                  ></input>
                  <button type='button'
                          className='delete-button'
                          onClick={ () => this.handleDelete(task.id) }
                  >
                    <strong>X</strong>
                  </button>
                </form>
              </li>);
            })
        }
      </ul>
    );
  }
}

const ListModalWithDataAndMutations = compose(
  graphql(gql`
    query ($id: Int!) {
      list(id: $id) {
        tasks {
          id
          body
        }
      }
    }`
  ),
  graphql(gql`
    mutation createTask($listId: Int!, $body: String!) {
      createTask(listId: $listId, body: $body) {
        id
        body
      }
    }`,
    { name: 'createTaskMutation' }
  ),
  graphql(gql`
    mutation updateTask($taskId: Int!, $body: String!) {
      updateTask(taskId: $taskId, body: $body) {
        id
        body
      }
    }`,
    { name: 'updateTaskMutation' }
  ),
  graphql(gql`
    mutation deleteTask($taskId: Int!) {
      deleteTask(taskId: $taskId) {
        id
        body
      }
    }`,
    { name: 'deleteTaskMutation' }
  ),
  graphql(gql`
    mutation updateList($listId: Int!, $title: String!) {
      updateList(listId: $listId, title: $title) {
        id
        title
      }
    }`,
    { name: 'updateListMutation' }
  )
)(ListModal);

export default ListModalWithDataAndMutations;
