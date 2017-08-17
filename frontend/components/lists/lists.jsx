import React from 'react';
import { compose } from 'react-apollo';
import { getLists } from '../../../app/graphql/queries/lists.js';
import {
  createList,
  updateList,
  deleteList
} from '../../../app/graphql/mutations/lists.js';

class Lists extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: '' };
    this.updateInput = this.updateInput.bind(this);
    this.createList = this.createList.bind(this);
  }

  updateInput(e) {
    e.preventDefault();
    this.setState({ title: e.target.value });
  }

  openList(list) {
    return e => {
      e.preventDefault();
      this.props.updateParent({
        modalVisible: true,
        selectedList: { id: list.id, title: list.title }
      });
    };
  }

  createList(e) {
    e.preventDefault();
    if (this.state.title) {
      this.props.createListMutation({ variables: { title: this.state.title }})
      .then(() => {
        this.setState({ title: '' });
        this.props.data.refetch()
        .then(({ data: { lists }}) => {
          const lastListIndex = lists.length - 1;
          this.props.updateParent({
            modalVisible: true,
            selectedList: {
              id: lists[lastListIndex].id,
              title: lists[lastListIndex].title
            }
          });
        });
      });
    }
  }

  updateList(listId, title, listOrderNumber) {
    this.props.updateListMutation({
      variables: { listId, title, listOrderNumber }
    })
    .then(() => {
      this.props.data.refetch();
    });
  }

  deleteList(listId, listOrderNumber) {
    return e => {
      e.preventDefault();
      this.props.deleteListMutation({ variables: { listId }})
      .then(() => {
        if (listId === this.props.selectedList.id) {
          this.props.updateParent({ modalVisible: false });
        }
        this.props.data.refetch();
        [...this.props.data.lists].forEach(list => {
          if (list.listOrderNumber > listOrderNumber) {
            this.updateList(list.id, list.title, list.listOrderNumber - 1);
          }
        });
      });
    };
  }

  setNewOrder(listOrderNumber) {
    return e => {
      e.preventDefault();
      if (listOrderNumber !== this.newOrderNumber) {
        this.newOrderNumber = listOrderNumber;
        e.target.closest('li').className = 'task-darken';
      }
    };
  }

  getOrderOffset(list, listOrderNumber) {
    let direction = listOrderNumber - this.newOrderNumber < 0 ? 'down' : 'up';
    let aboveNewOrder = list.listOrderNumber <= this.newOrderNumber;
    let belowOldOrder = list.listOrderNumber >= listOrderNumber;
    let belowNewOrder = list.listOrderNumber >= this.newOrderNumber;
    let aboveOldOrder = list.listOrderNumber <= listOrderNumber;
    if (direction === 'down' && aboveNewOrder && belowOldOrder) {
      return -1;
    } else if (direction === 'up' && belowNewOrder && aboveOldOrder) {
      return 1;
    } else { return 0; }
  }

  updateOrderNumber(draggedList) {
    return e => {
      e.preventDefault();
      let lists = document.getElementsByClassName('lists-nav')[0].children;
      for (let i = 0; i < lists.length; i++) {
        lists[i].classList.remove('task-darken');
      }
      if (draggedList.listOrderNumber !== this.newOrderNumber) {
        [...this.props.data.lists].forEach(list => {
          let offset = this.getOrderOffset(list, draggedList.listOrderNumber);
          if (offset) {
            let [orderNum, title] = [list.listOrderNumber + offset, list.title];
            if (list.id === draggedList.id) {
              orderNum = this.newOrderNumber;
            }
            this.updateList(list.id, list.title, orderNum);
          }
        });
      }
    };
  }

  activateShadowEffect(e) {
    e.preventDefault();
    e.target.closest('li').className = 'task-darken';
  }

  removeShadowEffect(e) {
    e.preventDefault();
    e.target.closest('li').classList.remove('task-darken');
  }

  setDragAndDropEffect(e) {
    e.dataTransfer.effectAllowed = 'move';
  }

  render() {
    if (this.props.data.loading) { return null; }
    if (this.props.data.error) {
      return (<strong>{ this.props.data.error.message }</strong>);
    }

    return (
      <ul className='lists-nav'>
        <li>Your Lists:</li>
        <li key={ 'newList' }>
          <form onSubmit={ this.createList }>
            <input onChange={ this.updateInput }
                   placeholder='Create a New List Here'
                   value={ this.state.title }
            ></input>
            <button className='add-button' type='submit'>
              <strong>✓</strong>
            </button>
          </form>
        </li>
        { [...this.props.data.lists].sort((x, y) => {
            return x.listOrderNumber - y.listOrderNumber;
          })
          .map(list =>
            <li key={ list.id }
              onDragEnter={ this.activateShadowEffect }
              onDragOver={ this.setDragAndDropEffect }
            >
              <button draggable={ true }
                      onClick={ this.openList(list) }
                      onDragStart={ this.setDragAndDropEffect }
                      onDragEnter={ this.setNewOrder(list.listOrderNumber) }
                      onDragLeave={ this.removeShadowEffect }
                      onDragEnd={ this.updateOrderNumber(list) }
              >
                { list.title }
              </button>
              <button className='delete-button'
                      onClick={ this.deleteList(list.id, list.listOrderNumber) }
              >
                <strong>X</strong>
              </button>
            </li>
          )
        }
      </ul>
    );
  }
}

const ListsWithDataAndMutations = compose(
  getLists, createList, updateList, deleteList
)(Lists);

export default ListsWithDataAndMutations;
