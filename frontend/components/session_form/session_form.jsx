import React from 'react';
import { hashHistory } from 'react-router';
import { gql, graphql, compose } from 'react-apollo';

class SessionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: '', password: '' };
  }

  componentWillUnmount() {
    for (let i = 1; i < 5; i++) {
      clearInterval(this[`timer0${i}`]);
    }
  }

  update(field) {
    return e => {
      this.setState({ [field]: e.target.value });
    };
  }

  handleSubmit(mutType) {
    let dataType;
    dataType = mutType === 'signInUserMutation' ? 'signInUser' : 'createUser';
    return e => {
      e.preventDefault();
      if (this.state.password.length < 6) {
        window.alert('Passwords must be at least 6 characters');
        return null;
      }
      this.props[mutType]({
        variables: {
          username: this.state.username,
          password: this.state.password
        }})
      .then(response => {
        if (response.data[dataType]) {
          this.props.signInUser(response.data[dataType]);
          hashHistory.push('/lists');
        } else {
          window.alert('Invalid Username/Password combination');
        }
      });
    };
  }

  demoSignIn(e) {
    e.preventDefault();
    let usernameIndex = 0;
    let passwordIndex = 0;
    let username = 'JeanLucPicard';
    let password = '123123123123';
    this.timer01 = setInterval(() => {
      this.setState({ username: username.slice(0,usernameIndex) });
      usernameIndex++;
    }, 40);
    this.timer02 = setTimeout(() => {
      this.timer03 = setInterval(() => {
        this.setState({ password: password.slice(0,passwordIndex) });
        passwordIndex++;
      }, 40);
    }, 550);
    this.timer04 = setTimeout(() => {
      this.handleSubmit('signInUserMutation')({ preventDefault: () => null });
    }, 1250);
  }

  render() {
    return (
      <form onSubmit={ this.handleSubmit('signInUserMutation').bind(this)}
            className='session-form'
      >
        <input type='text'
               placeholder='Username'
               value={ this.state.username }
               onChange={ this.update('username').bind(this) }
        />
        <input type='password'
                 placeholder='Password'
                 value={ this.state.password }
                 onChange={ this.update('password').bind(this) }
          />
        <button type='submit'>Sign In</button>
        <button onClick={ this.handleSubmit('signUpUserMutation').bind(this) }>
          Sign Up
        </button>
        <button onClick={ this.demoSignIn.bind(this) }>Demo</button>
      </form>
    );
  }
}

const SessionFormWithMutations = compose(
  graphql(gql`
    mutation signInUser($username: String!, $password: String!) {
      signInUser(username: $username, password: $password) {
        id
        username
        backgroundPreference
      }
    }`,
    { name: 'signInUserMutation' }),
  graphql(gql`
    mutation signUpUser($username: String!, $password: String!) {
      createUser(username: $username, password: $password) {
        id
        username
        backgroundPreference
      }
    }`,
    { name: 'signUpUserMutation' }
  )
)(SessionForm);

export default SessionFormWithMutations;
