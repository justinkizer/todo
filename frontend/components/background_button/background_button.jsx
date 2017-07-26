import React from 'react';
import { gql, graphql } from 'react-apollo';

const BackgroundButton = ({
    mutate, currentUser, updateUser, changeBackground
  }) => {

  const handleClick = () => {
    let selection = currentUser.backgroundPreference + 1;
    if (selection > 4) { selection = 0; }
      mutate({ variables: { backgroundPreference: selection }})
        .then(() => {
          updateUser({
            id: currentUser.id,
            username: currentUser.username,
            backgroundPreference: selection
          });
          changeBackground(selection);
        });
  };

  return (
    <button onClick={ handleClick }>Change of scenery?</button>
  );
};

const BackgroundButtonWithMutation = graphql(gql`
  mutation ($backgroundPreference: Int!) {
    updateUser(backgroundPreference: $backgroundPreference) {
      id
      username
      backgroundPreference
    }
  }
`)(BackgroundButton);

export default BackgroundButtonWithMutation;
