import React from 'react';
import { hashHistory } from 'react-router';
import { gql, graphql, withApollo } from 'react-apollo';

const SignOutButton = props => {

  const handleClick = () => {
    props.mutate()
      .then(() => {
        props.signOutUser();
        hashHistory.push('/');
      }).then(() => props.client.resetStore());
  };

  return (
    <button onClick={ handleClick }>Sign Out?</button>
  );
};

const SignOutButtonWithMutation = withApollo(graphql(gql`
  mutation {
    signOutUser {
      username
    }
  }
`)(SignOutButton));

export default SignOutButtonWithMutation;
