import { RECEIVE_CURRENT_USER } from '../../actions/session_actions.js';
import merge from 'lodash/merge';

const initialState = { currentUser: null };

const SessionReducer = (state = initialState, action) => {
  Object.freeze(state);
  let newState = merge({}, state);
  switch(action.type) {
    case RECEIVE_CURRENT_USER:
      if (action.currentUser) {
        newState.currentUser = {
          id: action.currentUser.id,
          username: action.currentUser.username,
          backgroundPreference: action.currentUser.backgroundPreference
        };
      }
      else {
        newState.currentUser = null;
      }
      return newState;
    default:
      return state;
  }
};

export default SessionReducer;
