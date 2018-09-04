import 'normalize.css/normalize.css';
import 'prismjs/themes/prism.css';
import '@material/button/dist/mdc.button.css';
import '@material/drawer/dist/mdc.drawer.css';
import '@material/list/dist/mdc.list.css';
import '@material/theme/dist/mdc.theme.css';
import '@material/icon-button/dist/mdc.icon-button.css';
import '@material/textfield/dist/mdc.textfield.css';
import '@material/checkbox/dist/mdc.checkbox.css';
import '@material/fab/dist/mdc.fab.css';
import '@material/top-app-bar/dist/mdc.top-app-bar.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './app';
import './index.css';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { createStore } from './state/store';
import { ThemeProvider } from 'rmwc/Theme';

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <ThemeProvider
        options={{
          primary: '#00acc1',
          secondary: 'black'
        }}
      >
        <App />
      </ThemeProvider>
    </Router>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
