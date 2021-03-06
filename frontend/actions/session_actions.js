export const RECEIVE_CURRENT_USER = 'RECEIVE_CURRENT_USER';

export const receiveCurrentUser = currentUser => ({
  type: RECEIVE_CURRENT_USER,
  currentUser
});

export const signInUser = user => dispatch => (
  dispatch(receiveCurrentUser(user))
);

export const signOutUser = () => dispatch => (
  dispatch(receiveCurrentUser(null))
);
