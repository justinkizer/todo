import React from 'react';
import { gql, graphql, compose } from 'react-apollo';

class Lists extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: '' };
  }

  update(e) {
    this.setState({ title: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
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

  handleDelete(listId) {
    this.props.deleteListMutation({ variables: { listId }})
      .then(() => {
        if (listId === this.props.selectedList.id) {
          this.props.updateParent({ modalVisible: false });
        }
        this.props.data.refetch();
      });
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
          <form onSubmit={ this.handleSubmit.bind(this) }>
            <input onChange={ this.update.bind(this) }
                   placeholder='Create a New List Here'
                   value={ this.state.title }
            >
            </input>
            <button className='add-button' type='submit'>
              <strong>✔</strong>
            </button>
          </form>
        </li>
        { this.props.data.lists.map(list =>
          <li key={ list.id }>
            <button onClick={
              () => this.props.updateParent({
                modalVisible: true,
                selectedList: {
                  id: list.id, title: list.title
                }
              })
            }>
              { list.title }
            </button>
            <button className='delete-button'
                    onClick={ () => this.handleDelete(list.id) }
            >
              <strong>X</strong>
            </button>
          </li>)
        }
      </ul>
    );
  }
}

const ListsWithDataAndMutations = compose(
  graphql(gql`
    query {
      lists {
        id
        title
      }
    }`
  ),
  graphql(gql`
    mutation createList($title: String!) {
      createList(title: $title) {
        id
        title
      }
    }`,
    { name: 'createListMutation' }
  ),
  graphql(gql`
    mutation deleteList($listId: Int!) {
      deleteList(listId: $listId) {
        id
        title
      }
    }`,
    { name: 'deleteListMutation' }
  )
)(Lists);

export default ListsWithDataAndMutations;
