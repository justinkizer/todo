import React from 'react';
import { hashHistory } from 'react-router';
import SessionForm from '../session_form/session_form_container.js';

class SplashPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    if (this.props.currentUser) {
      hashHistory.push('/lists');
    }
  }

  render() {
    return (
      <div className='splash-page-container'>
        <img src={'http://res.cloudinary.com/one-thousand-words/'
               .concat('image/upload/v1500945211/mqlsyy4nhnxvuxkkktvi.png')}
             className='splash-page-logo'
        >
        </img>
        <SessionForm />
      </div>
    );
  }
}

export default SplashPage;
