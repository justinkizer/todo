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
    this.createTask = this.createTask.bind(this);
    this.updateList = this.updateList.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setActiveListTitle = this.setActiveListTitle.bind(this);
    this.selectListTitle = this.selectListTitle.bind(this);
    this.moveCursorToEndOfText = this.moveCursorToEndOfText.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({ title: newProps.selectedList.title });
  }

  componentWillUnmount() {
    this.timers.forEach(timer => clearInterval(timer));
  }

  updateInput(id, updateType) {
    return e => {
      e.preventDefault();
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

  createTask(e) {
    e.preventDefault();
    if (this.state.body) {
      this.props.createTaskMutation({
        variables: { listId: this.props.id, body: this.state.body }
      })
      .then(() => {
        this.setState({ body: '' });
        this.props.data.refetch();
      });
    }
  }

  updateTask(taskId, taskOrderNumber, body) {
    if (!this.justUpdated && this.changed) {
      if (!body) { body = this.state[taskId].body; }
      this.props.updateTaskMutation({
        variables: { taskId, body, taskOrderNumber }
      })
      .then(() => {
        this.justUpdated = true;
        this.changed = false;
        this.timers.push(setTimeout(() => {
          this.justUpdated = false;
        }, 500));
        document.activeElement.blur();
      });
    }
    if (!this.changed) { document.activeElement.blur(); }
  }

  deleteTask(taskId, taskOrderNumber) {
    return e => {
      if (e) { e.preventDefault(); }
      this.props.deleteTaskMutation({ variables: { taskId } })
      .then(() => {
        this.props.data.refetch();
        [...this.props.data.list.tasks].forEach(task => {
          if (task.taskOrderNumber > taskOrderNumber) {
            this.justUpdated = false;
            this.changed = true;
            this.updateTask(task.id, task.taskOrderNumber - 1, task.body);
          }
        });
      });
    };
  }

  updateList(e) {
    e.preventDefault();
    if (!this.justUpdated && this.changed) {
      if (this.state.title) {
        document.getElementById('list_name').disabled = true;
        this.props.updateListMutation({
          variables: {
            listId: this.props.id,
            title: this.state.title,
            listOrderNumber: this.props.data.list.listOrderNumber
          }
        })
        .then(() => {
          this.props.updateParent({
            selectedList: { id: this.props.id, title: this.state.title }
          });
          this.changed = false;
          document.activeElement.blur();
        });
      } else {
        document.getElementById('list_name').disabled = true;
        this.setState({ title: this.props.selectedList.title });
        document.activeElement.blur();
      }
    }
    if (!this.changed) { document.activeElement.blur(); }
  }

  handleEditTaskSubmit(task) {
    return e => {
      e.preventDefault();
      let target = e.target.closest('li').querySelector('input');
      if (target.value === '') {
        this.deleteTask(task.id, task.taskOrderNumber)();
      } else {
        target.className = 'disable-input';
        this.updateTask(task.id, task.taskOrderNumber);
      }
    };
  }

  setNewOrder(taskOrderNumber) {
    return e => {
      e.preventDefault();
      if (taskOrderNumber !== this.newOrderNumber) {
        this.newOrderNumber = taskOrderNumber;
        e.target.closest('li').className = 'task-darken';
      }
    };
  }

  getOrderOffset(task, taskOrderNumber) {
    let direction = taskOrderNumber - this.newOrderNumber < 0 ? 'down' : 'up';
    let aboveNewOrder = task.taskOrderNumber <= this.newOrderNumber;
    let belowOldOrder = task.taskOrderNumber >= taskOrderNumber;
    let belowNewOrder = task.taskOrderNumber >= this.newOrderNumber;
    let aboveOldOrder = task.taskOrderNumber <= taskOrderNumber;
    if (direction === 'down' && aboveNewOrder && belowOldOrder) {
      return -1;
    } else if (direction === 'up' && belowNewOrder && aboveOldOrder) {
      return 1;
    } else { return 0; }
  }

  updateOrderNumber(taskId, taskOrderNumber) {
    return e => {
      e.preventDefault();
      let lists = document.getElementsByClassName('tasks-nav')[0].children;
      for (let i = 0; i < lists.length; i++) {
        lists[i].classList.remove('task-darken');
      }
      if (taskOrderNumber !== this.newOrderNumber) {
        this.changed = true;
        [...this.props.data.list.tasks].forEach(task => {
          let offset = this.getOrderOffset(task, taskOrderNumber);
          if (offset) {
            let [orderNum, body] = [task.taskOrderNumber + offset, task.body];
            if (task.id === taskId) {
              [orderNum, body] = [this.newOrderNumber, this.state[taskId].body];
            }
            this.updateTask(task.id, orderNum, body);
          }
        });
      }
    };
  }

  closeModal(e) {
    e.preventDefault();
    this.props.updateParent({ modalVisible: false });
  }

  setActiveListTitle(e) {
    e.preventDefault();
    this.setState({ title: this.props.selectedList.title });
  }

  selectListTitle(e) {
    e.preventDefault();
    this.changed = true;
    document.getElementById('list_name').disabled = false;
    document.getElementById('list_name').focus();
    this.moveCursorToEndOfText();
  }

  activateHoverEffect(e) {
    e.preventDefault();
    e.target.closest('li').className = 'tasks-nav-hover';
  }

  removeHoverEffect(e) {
    e.preventDefault();
    e.target.closest('li').classList.remove('tasks-nav-hover');
  }

  activateShadowEffect(e) {
    e.preventDefault();
    e.target.closest('li').className = 'task-darken';
  }

  removeShadowEffect(e) {
    e.preventDefault();
    e.target.closest('li').classList.remove('task-darken');
  }

  moveCursorToEndOfText(e) {
    if (e) { e.preventDefault(); }
    this.timers.push(setTimeout(() => {
      if (typeof document.activeElement.setSelectionRange === 'function') {
         document.activeElement.setSelectionRange(1000, 1000);
      }
    }, 0));
  }

  setDragAndDropEffect(e) {
    e.dataTransfer.effectAllowed = 'move';
  }

  storeActiveTaskBody(task) {
    return e => {
      let target = e.target.closest('li').querySelector('input');
      this.setState({ [task.id]: { body: target.value }});
    };
  }

  enableInput(e) {
    e.preventDefault();
    let target = e.target.closest('li').querySelector('input');
    target.classList.remove('disable-input');
    target.focus();
  }

  render() {
    if (this.props.data.loading) { return null; }
    if (this.props.data.error) {
      return (<strong>{ this.props.data.error.message }</strong>);
    }

    return (
      <ul className='tasks-nav'>
        <li className='list-name'>
          <form onSubmit={ this.updateList }>
            <input id='list_name'
                   disabled
                   onChange={ this.updateInput(this.props.id, 'list') }
                   onFocus={ this.setActiveListTitle }
                   onBlur={ this.updateList }
                   value={ this.state.title }
            ></input>
          </form>
          <strong onClick={ this.selectListTitle }>✎</strong>
        </li>
        <button className='close-modal-button' onClick={ this.closeModal }>
          <strong>X</strong>
        </button>
        <li key={ 'newTask' } className='create-task-li'>
          <form className='task-create-item-form' onSubmit={ this.createTask }>
            <input onChange={ this.updateInput() }
                   placeholder='Create a New Task Here'
                   value={ this.state.body }
            ></input>
            <button className='add-button' type='submit'>
              <strong>✔</strong>
            </button>
          </form>
        </li>
        { [...this.props.data.list.tasks].sort((x, y) => {
            return x.taskOrderNumber - y.taskOrderNumber;
          })
          .map(task => {
            let value = task.body;
            if (typeof this.state[task.id] !== 'undefined') {
              value = this.state[task.id].body;
            }
            return (
              <li key={ task.id }
                  onDragEnter={ this.activateShadowEffect }
                  onDragOver={ this.setDragAndDropEffect }
                  onMouseEnter={ this.activateHoverEffect }
                  onMouseLeave={ this.removeHoverEffect }
              >
                <form className='task-item-form'
                      onSubmit={ this.handleEditTaskSubmit(task) }
                >
                  <div draggable={ true }
                       onDragStart={ this.setDragAndDropEffect }
                       onDragEnter={ this.setNewOrder(task.taskOrderNumber) }
                       onDragLeave={ this.removeShadowEffect }
                       onDragEnd={
                         this.updateOrderNumber(task.id, task.taskOrderNumber)
                       }
                       onMouseUp={ this.enableInput }
                       onMouseDown={ this.storeActiveTaskBody(task) }
                  >
                    <input className='disable-input'
                           type='text'
                           onChange={ this.updateInput(task.id, 'task') }
                           onFocus={ this.moveCursorToEndOfText }
                           onBlur={ this.handleEditTaskSubmit(task) }
                           value={ value }
                    ></input>
                  </div>
                  <button className='delete-button'
                          type='button'
                          onClick={
                            this.deleteTask(task.id, task.taskOrderNumber)
                          }
                  >
                    <strong>X</strong>
                  </button>
                </form>
              </li>
            );
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
