import { combineReducers } from 'redux';
import { ApolloClient, createNetworkInterface } from 'react-apollo';
import SessionReducer from './sessions/session_reducer.js';

const networkInterface = createNetworkInterface({
  uri: '/graphql',
  opts: {
    credentials: 'same-origin',
    headers: {
      'X-CSRF-TOKEN': $('meta[name=csrf-token]').attr('content'),
    },
  },
});

export const client = new ApolloClient({ networkInterface });

export const rootReducer = combineReducers({
  session: SessionReducer,
  apollo: client.reducer()
});
