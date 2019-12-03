# Setup Redux

Setting up Redux can range from simple to complicated and tends to be one of the major pain points for beginners. Redux StateBranch comes with a simplified `createStore` function to help with some of the complexity. You're not required to use this, but it's here for convenience.

## Install redux
`bash
npm install react-redux
`

## Basic Store Setup
Create a file in your src folder called `state/store.tsx`;

```js
import { createStore } from 'redux-state-branch';

export const store = createStore({
  devTools: true, 
  reducers: {
    // Your reducers will go here
  }
});
```

## Adding Async Actions (Recommended)
Unless you're writing a client side only app, you'll probably want to interface with a server using `fetch` requests. Using `redux-thunk` is a simple and sane way to add async handling to your redux setup.

```bash
npm install redux-thunk
```

Back in your `state/store.tsx` file...
```js
import { createStore } from 'redux-state-branch';
import thunk from 'redux-thunk';

export const store = createStore({
  devTools: true,
  middleware: [thunk],
  reducers: {
    // Your reducers will go here
  }
});
```

## Add your store to your app
In your main `index.tsx` file, create your store and add it to your app.

```js
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './app';
import { store } from './state/store';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
```