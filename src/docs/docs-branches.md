# Branches

A branch is just a piece of your state tree that encapsulates your data and logic. It makes only a handful of assumptions:

- You'll be dealing with lists of items. i.e. Users, Projects, Todos, Widgets, etc.
- All items will have an `id`.
- The branch contains an object called items.

## Branches API
```js
/**
 * Constructor
 */
const myBranch = new StateBranch({
  // the name of the branch
  name: string,
  // optional actions
  actions?: typeof Actions,
  // optional selectors
  selectors?: typeof Selectors,
  // optional defaults for an item
  defaultItem?: Object,
  // optional default initial state
  // must contain { items: {} }
  defaultState?: Object,
  // optional custom reducer handling
  reducer?: Function
})

/**
 * Instance
 */

// Branch name
myBranch.name

// Reducer
myBranch.reducer

// Accessing actions
myBranch.action.myActionName

// Accessing selectors
myBranch.select.mySelectorName
```

## Create a Branch
Creating new branches is easy.
Make a new file at `state/todos/index.js`;
```js
// state/todos/index.js
import { StateBranch } from 'redux-state-branch';

export const todosBranch = new StateBranch({
  // name our branch
  name: 'todos',
  
  // Required. what does the default state look like? 
  // This can be anything you want, but `items` has to be included.
  defaultState: {
    loading: false,
    viewByFilter: 'all',
    items: {}
  },
  
  // Optional. Defaults for any new items being created.
  defaultItem: {
    text: '',
    priority: 'normal',
    isDone: false
  }
});
```

## Add to Store
Add your newly created branch to your rootReducer.

```js
// state/store.js
import {
  combineReducers,
  createStore as reduxCreateStore
} from 'redux';

import { todosBranch } from './todos/index.js';

const rootReducer = combineReducers({
  [todosBranch.name]: todosBranch.reducer
});

export const createStore = () => {
  return reduxCreateStore(rootReducer);
};
```

## What did we get?
A lot actually. With that little bit of setup, we can build a fully functional todo app.

We connect our store to redux like we normally would and dispatch actions. The difference here is that we import `todosBranch` where we can do CRUD actions using its selectors and actions.

```jsx renderOnly
import { TodosExample } from './todos-examples.js'
<TodosExample />
```

```jsx
import * as React from 'react';
import { connect } from 'react-redux';
import { todosBranch } from './state/todos';

/**
 * An example component showing a simple todo App.
 */
const TodosExample_ = ({
  todos,
  createTodo,
  updateTodo,
  deleteTodo,
  resetTodos
}) => (
  <div className="todos-example">
    <button onClick={createTodo}>New Todo</button>
    <button onClick={resetTodos}>Reset</button>

    {todos.map(todo => (
      <div key={todo.id}>
        <input
          type="checkbox"
          checked={todo.isDone}
          onChange={evt =>
            // You don't have to pass around the whole todo object, just the things you want to update and the ID.
            updateTodo({ id: todo.id, isDone: evt.target.checked })
          }
        />
        <input
          placeholder="Write something..."
          value={todo.text}
          onChange={evt =>
            updateTodo({ id: todo.id, text: evt.target.value })
          }
        />
        <button onClick={() => deleteTodo(todo)}>&times;</button>
      </div>
    ))}
  </div>
);

/**
 * Connect to your Redux Store
 */
const TodosExample = connect(
  state => ({
    // Select all Todos from the Todos branch
    todos: todosBranch.select.all(state)
  }),
  dispatch => ({
    // Dispatch actions from the todos branch.
    updateTodo: todo => dispatch(todosBranch.action.update(todo)),
    createTodo: () => dispatch(todosBranch.action.create()),
    resetTodos: () => dispatch(todosBranch.action.reset()),
    deleteTodo: todo => dispatch(todosBranch.action.delete(todo))
  })
)(TodosExample_);
```

## Whats next?
While this example is simplistic, it puts too much business logic in the view. Next we'll look into adding our own custom actions that will be more powerful and keep the business logic higher up in the app with our state branch.