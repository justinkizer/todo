import React from 'react';
import { hashHistory } from 'react-router';
import { gql, graphql } from 'react-apollo';
import SignOutButton from '../sign_out_button/sign_out_button_container.js';
import BGButton from '../background_button/background_button_container.js';
import ListsWithDataAndMutations from '../lists/lists.jsx';
import ListModalWithDataAndMutations from '../list_modal/list_modal.jsx';

class MainPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modalVisible: false, selectedList: { id: null, title: '' }};
  }

  componentWillMount() {
    this.changeBackground(this.props.currentUser.backgroundPreference);
    this.username = this.props.currentUser.username;
  }

  componentWillUnmount() {
    this.changeBackground(0);
  }

  changeBackground(backgroundNum) {
    document.getElementById('page_body').className='bg'+backgroundNum;
  }

  updateParent() {
    return newState => this.setState(newState);
  }

  render() {
    let listModal;
    if (this.state.modalVisible) {
      listModal = (<ListModalWithDataAndMutations
                    updateParent={ this.updateParent() }
                    selectedList={ this.state.selectedList }
                    id={ this.state.selectedList.id }
                  />);
    } else { listModal = undefined; }

    return (
      <div className='main-page-container'>
        <ListsWithDataAndMutations updateParent={ this.updateParent() }
                                   selectedList={ this.state.selectedList }
        />
        <strong>Welcome, { this.username }!</strong>
        <SignOutButton />
        <BGButton changeBackground={ this.changeBackground } />
        { listModal }
      </div>
    );
  }
}

export default MainPage;
