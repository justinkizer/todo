import React from 'react';
import { compose } from 'react-apollo';
import { getList } from '../../../app/graphql/queries/lists.js';
import { updateList } from '../../../app/graphql/mutations/lists.js';
import {
  createTask,
  updateTask,
  deleteTask
} from '../../../app/graphql/mutations/tasks.js';

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
                this.changed = false;
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
              this.changed = false;
              document.activeElement.blur();
            });
        }
      }
      if (!this.changed) { document.activeElement.blur(); }
    };
  }

  handleDelete(taskId, taskOrderNumber) {
    this.props.deleteTaskMutation({
      variables: { taskId: taskId }
    })
      .then(() => {
        this.props.data.refetch();
        [...this.props.data.list.tasks].forEach(task => {
          if (task.taskOrderNumber > taskOrderNumber) {
            this.justUpdated = false;
            this.changed = true;
            this.handleUpdate(task.id, 'task', task.taskOrderNumber - 1,
              task.body
            )();
          }
        });
      });
  }

  currentOrder(taskOrderNumber, e) {
    if (taskOrderNumber !== this.currentOrderNumber) {
      this.currentOrderNumber = taskOrderNumber;
      let target = e.target;
      while (target.nodeName !== 'LI') {
        target = target.parentNode;
      }
      target.className = 'task-darken';
    }
  }

  updateOrderNumber(taskId, taskOrderNumber) {
    return () => {
      let listElements = document.getElementsByClassName('tasks-nav')[0].children;
      for (let i = 0; i < listElements.length; i++) {
        listElements[i].classList.remove('task-darken');
      }
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
                                         this.timers.push(setTimeout(() => document.activeElement.setSelectionRange(1000,1000), 0));
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
              let value;
              if (typeof this.state[task.id] !== 'undefined') {
                value = this.state[task.id].body;
              } else {
                value = task.body;
              }
              return (
                <li key={ task.id }
                    onDragEnter={ e => { if (e.target.nodeName === 'LI') { e.target.className = 'task-darken'; }}}
                    onDragOver={e => {e.dataTransfer.effectAllowed = "move"; e.preventDefault();}}
                    onMouseEnter={e => {
                      let target = e.target;
                      while (target.nodeName !== 'LI') {
                        target = target.parentNode;
                      }
                      target.className = 'tasks-nav-hover';}}
                    onMouseLeave={e => {
                      let target = e.target;
                      while (target.nodeName !== 'LI') {
                        target = target.parentNode;
                      }
                      target.classList.remove('tasks-nav-hover');}}
                >
                  <form onSubmit={  e => {
                      e.preventDefault();
                    if (e.target.firstChild.firstChild.value === '') {
                       this.handleDelete(task.id, task.taskOrderNumber);} else {this.handleUpdate(task.id, 'task',
                                    task.taskOrderNumber
                                 )();}}}
                        className='task-item-form'
                  >
                    <div draggable={ true }
                         onDragStart={e => {e.dataTransfer.effectAllowed = "move";}}
                         onDragEnter={
                           e => {
                             this.currentOrder(task.taskOrderNumber, e);
                           }
                         }
                         onDragLeave={
                           e => {
                             let target = e.target;
                             while (target.nodeName !== 'LI') {
                               target = target.parentNode;
                             }
                             target.classList.remove('task-darken');
                           }
                         }
                         onDragEnd={ this.updateOrderNumber(task.id,
                           task.taskOrderNumber
                         )}
                         onMouseUp={ e => {
                           let target = e.target.type ? e.target : e.target.firstChild;
                           target.classList.remove('disable-input');
                           target.focus();
                         }}
                         onMouseDown={ e => {
                           let target = e.target;
                           while (target.nodeName !== 'INPUT') {
                             target = target.firstChild;
                           }
                           this.setState({ [task.id]: { body: target.value }});
                         }}
                    >
                      <input type='text'
                             className='disable-input'
                             onChange={ this.update(task.id, 'task') }
                             onFocus={ e => {
                               this.timers.push(
                                 setTimeout(() => {
                                   if (typeof document.activeElement.setSelectionRange === 'function') {
                                      document.activeElement.setSelectionRange(1000,1000);
                                    }
                                  }, 0));
                                }
                              }
                             onBlur={ e => {
                               if (e.target.value === '') { this.handleDelete(task.id, task.taskOrderNumber);} else {
                                        e.target.className = 'disable-input';
                                        this.handleUpdate(task.id, 'task',
                                          task.taskOrderNumber
                                    )();}}}
                             value={ value }
                      ></input>
                    </div>
                    <button type='button'
                            className='delete-button'
                            onClick={ () => this.handleDelete(task.id, task.taskOrderNumber) }
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
  getList, updateList, createTask, updateTask, deleteTask
)(ListModal);

export default ListModalWithDataAndMutations;
