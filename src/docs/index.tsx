import '@material/drawer/dist/mdc.drawer.css';
import '@material/list/dist/mdc.list.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './app';
import './index.css';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { createStore } from './state/store';

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
