import React from 'react';
import { gql, graphql, compose } from 'react-apollo';

class ListModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: this.props.selectedList.title, body: '' };
    this.timers = [];
    this.handleCreateTask = this.handleCreateTask.bind(this);
    this.update = this.update.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({ title: newProps.selectedList.title });
  }

  componentWillUnmount() {
    this.timers.forEach(timer => {
      clearInterval(timer);
    });
  }

  update(id, updateType) {
    return e => {
      if (updateType === 'task') {
        this.changed = true;
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

  handleUpdate(taskId, updateType, taskOrderNumber, body) {
    return e => {
      if (e) { e.preventDefault(); }
      if (!this.justUpdated && this.changed) {
        if (updateType === 'task') {
          if (!body) { body = this.state[taskId].body; }
          this.props.updateTaskMutation({
            variables: {
              taskId,
              body,
              taskOrderNumber
            }
          })
            .then(() => {
              this.justUpdated = true;
              this.timers.push(setTimeout(() => {
                this.justUpdated = false;
              }, 500));
              document.activeElement.blur();
            });
        } else {
          document.getElementById('list_name').disabled = true;
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
      }
      if (!this.changed) { document.activeElement.blur(); }
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

  currentOrder(taskOrderNumber, e) {
    if (taskOrderNumber !== this.currentOrderNumber) {
      this.currentOrderNumber = taskOrderNumber;
      e.target.parentNode.parentNode.className = 'task-darken';
    }
  }

  updateOrderNumber(taskId, taskOrderNumber) {
    return () => {
      if (taskOrderNumber !== this.currentOrderNumber) {
        this.changed = true;
        let offset = taskOrderNumber - this.currentOrderNumber;
        [...this.props.data.list.tasks].forEach(task => {
          const draggingDownUpdateRequired = () => {
            return offset < 0 && task.taskOrderNumber <= this.currentOrderNumber
              && task.taskOrderNumber >= taskOrderNumber;
          };
          const draggingUpUpdateRequired = () => {
            return offset > 0 && task.taskOrderNumber >= this.currentOrderNumber
              && task.taskOrderNumber <= taskOrderNumber;
          };
          if (task.id === taskId) {
            this.handleUpdate(task.id, 'task', this.currentOrderNumber,
              this.state[taskId].body
            )();
          } else if (draggingDownUpdateRequired()) {
            this.handleUpdate(task.id, 'task', task.taskOrderNumber - 1,
              task.body
            )();
          } else if (draggingUpUpdateRequired()) {
            this.handleUpdate(task.id, 'task', task.taskOrderNumber + 1,
              task.body
            )();
          }
        });
      }
    };
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
                   onChange={ this.update(this.props.id, 'list') }
                   onFocus={ () => this.setState({
                     title: this.props.selectedList.title
                   })}
                   onBlur={ this.handleUpdate(this.props.id, 'list') }
                   value={ this.state.title }>
            </input>
          </form>
          <strong onClick={() => {
            this.changed = true;
            document.getElementById('list_name').disabled = false;
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
        <li key={ 'newTask' }
            className='create-task-li'
        >
          <form onSubmit={ this.handleCreateTask }
                className='task-create-item-form'
          >
            <input onChange={ this.update() }
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
            return x.taskOrderNumber - y.taskOrderNumber;
          })
            .map(task => {
              let value = this.state[task.id] ? this.state[task.id].body : null;
              value = value || task.body;
              return (
                <li key={ task.id }
                    onDragOver={ e => { e.target.className = 'task-darken'; }}
                    onDragLeave={ e => { e.target.className = ''; }}
                >
                  <form onSubmit={ this.handleUpdate(task.id, 'task',
                                    task.taskOrderNumber
                                 )}
                        className='task-item-form'
                  >
                    <input type='text'
                           draggable={ true }
                           onDragOver={
                             e => this.currentOrder(task.taskOrderNumber, e)
                           }
                           onDragLeave={
                             e => {
                               e.target.parentNode.parentNode.className = '';
                             }
                           }
                           onDragEnd={ this.updateOrderNumber(task.id,
                                        task.taskOrderNumber
                                     )}
                           onChange={ this.update(task.id, 'task') }
                           onBlur={ this.handleUpdate(task.id, 'task',
                                      task.taskOrderNumber
                                  )}
                           onFocus={ () => {
                             this.changed = false;
                             this.setState({ [task.id]: { body: task.body }});
                           }}
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
          taskOrderNumber
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
