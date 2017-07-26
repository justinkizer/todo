import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { client } from './reducers/root_reducer.js';
import configureStore from './store/store.js';
import Root from './components/root.jsx';

document.addEventListener('DOMContentLoaded', () => {
  let store;
  if (window.currentUser) {
    store = configureStore({ session: { currentUser: window.currentUser }});
  } else {
    store = configureStore();
  }

  ReactDOM.render(
    <ApolloProvider store={ store } client={ client }>
      <Root />
    </ApolloProvider>,
    document.getElementById('root')
  );
});
