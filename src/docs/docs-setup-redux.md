# Setup Redux

If you already have Redux setup, you can skip this. There aren't any custom steps to make `redux-state-branch` work, but trying to find a simple straightforward tutorial on the subject can be challenging. The following directions are for a web browser.

## Install redux
`bash
npm install react-redux
`

## Basic Store Setup
Create a file in your src folder called `state/store.js`;

```js
import {
  combineReducers,
  compose,
  createStore as reduxCreateStore
} from 'redux';

// Easiest way to get devtools working in your browser if you have the extension installed
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  // your reducers will go here
});

const enhancer = composeEnhancers();

export const createStore = () => {
  return reduxCreateStore(rootReducer, enhancer);
};
```

## Adding Async Actions (Recommended)
Unless you're writing a client side only app, you'll probably want to interface with a server using `fetch` requests. Using `redux-thunk` is a simple and sane way to add async handling to your redux setup.

```bash
npm install redux-thunk
```

Back in your `state/store.js` file...
```js
import {
  combineReducers,
  applyMiddleware, //import this
  compose,
  createStore as reduxCreateStore
} from 'redux';

import thunk from 'redux-thunk';

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  
});

// basically the same as above except we add the thunk middleware
const enhancer = composeEnhancers(applyMiddleware(thunk));

export const createStore = () => {
  return reduxCreateStore(rootReducer, enhancer);
};
```

## Add your store to your app
In your main index.js file, create your store and add it to your app.

```js
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './app';
import { createStore } from './state/store';

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
```