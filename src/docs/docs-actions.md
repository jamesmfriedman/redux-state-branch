# Actions

In a typical Redux setup, Action creators describe a way to change the state and the reducer actually modifies it. In Redux State Branch, actions are responsible for modifying the state and then calling any of the built in CRUD methods. You might have seen these built in CRUD methods used in the previous Branches example.

## Actions API
By default, each branch has the following actions available. The only expectation of any item being passed is that it contains an `id`. 

```js
class Actions {
  /**
   * Creates an item or an array of items
   * If you've provided a `defaultItem` to your reducer
   * it will be shallowly merged into each item.
   * If you don't pass an ID, one will be created for you.
   */
  create(items?: ItemsT<T>, devToolsSuffix?: string) {}

  /**
   * Replaces an item or an array of items
   * based on the items ID.
   */
  replace(items: ItemsT<T>) {}

  /**
   * Update an item or array of items
   * An item only needs to contain the ID
   * as well as the data you would like to update.
   * It will be shallowly merged over the existing items.
   */
  update(items: ItemsT<T>, devToolsSuffix?: string) {}

  /**
   * Delete by item, an array of items, 
   * an id, or an array of IDs
   */
  delete(items: ItemsT<T> | ID | ID[], devToolsSuffix?: string) {}

  /**
   * Set any non-item information at the root of the reducer
   * i.e. loading, filtering, etc.
   */
  setMeta(meta: { [key: string]: any }, devToolsSuffix?: string) {}

  /**
   * Reset the reducer to the initial state
   */
  reset(devToolsSuffix?: string) {}
}  
```


## Adding Custom Actions

To add custom actions, import and extend the Actions class and pass it to the StateBranch constructor. Each of your custom actions has to return a valid Redux action which can be done easily by calling one of the built in CRUD methods.

```js
// state/todos/index.js

// import Actions
import { StateBranch, Actions } from 'redux-state-branch';

// Create Todo Actions class
// Here we are creating a couple of new actions
// to sanitize our data before putting it into our store
class TodosActions extends Actions {
  toggleDone(todoId, isDone) {
    // do some sanitation of isDone to make sure it's a boolean
    return this.update({ id: todoId, isDone: !!isDone });
  }

  updateText(todoId, text) {
    // capitalize the first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    // Call update. We can optionally pass a string suffix
    // that will show up in our devTools
    return this.update({ id: todoId, text }, 'updateText');
  }
}

export const todosBranch = new StateBranch({ 
  name: 'todos',
  // pass in our custom actions
  actions: TodosActions,
  ...
});
```


## Using Actions
Any action will now be available for dispatch as `todosBranch.action.yourActionName`.

```jsx
import * as React from 'react';
import { connect } from 'react-redux';
import { todosBranch } from './state/todos';

// Back in your view where you are connecting your component to Redux.
const TodosExample = connect(
  state => ({...}),
  dispatch => ({
    // Calling built in actions
    createTodo: () => dispatch(todosBranch.action.create()),
    resetTodos: () => dispatch(todosBranch.action.reset()),
    deleteTodo: todo => dispatch(todosBranch.action.delete(todo)),
    // Calling the custom actions we created
    updateTodoText: (todoId, text) => dispatch(todosBranch.action.updateText(todoId, text)),
    toggleTodoDone: (todoId, isDone) => dispatch(todosBranch.action.toggleDone(todoId, isDone)),
  })
)(TodosExample_);
```

## Async Actions

Most apps are going to have some communication with a backend. `redux-state-branch` works with any async middleware, but `redux-thunk` is by far the easiest. Make sure you have `redux-thunk` installed and setup correctly and then you can add async actions as follows:

```js
// state/todos/index.js

// import Actions
import { StateBranch, Actions } from 'redux-state-branch';

// Async actions return a function that gets passed dispatch
class TodosActions extends Actions {
  // An Async action that updates the local store
  // and then calls the server
  changeOwner(todoId, ownerId) {
    return async (dispatch) => {
      // Optimistically update our todo
      dispatch(this.update({
        id: todoId, 
        ownerId
      }))

      // call our server
      await fetch('/updateTodoOwner', ...yourFetchOptions);
    }
  },

  // An async action that overloads the built in create action
  create(todoData) {
    return async (dispatch) => {
      // call our server
      const todo = await fetch('/createTodo', ...yourFetchOptions);
      
      // create our todo in the store
      dispatch(super.create(todo))
    }
  },

}

export const todosBranch = new StateBranch({ 
  name: 'todos',
  // pass in our custom actions
  actions: TodosActions,
  ...
});
```