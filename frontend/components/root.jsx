import React from 'react';
import { Router, Route, hashHistory } from 'react-router';
import SplashPage from './splash_page/splash_page_container.js';
import MainPage from './main_page/main_page_container.js';

const Root = () => {

  function scrollToTopOnRoute() {
    let { action } = this.state.location;
    if (action === 'PUSH') { window.scrollTo(0, 0); }
  }

  return (
    <Router history={ hashHistory } onUpdate={ scrollToTopOnRoute } >
      <Route path="/" component={ SplashPage }></Route>
      <Route path="/lists" component={ MainPage }></Route>
    </Router>
  );
};

export default Root;
