# Selectors

Selectors are the equivalent of queries for Redux. They are the best way to keep the shape of your state separate from the shape of your apps view data. `redux-state-branch` comes with a few built in selectors that you can leverage to build more of your own. 

## Selectors API
All selector methods take the stores state object as their first argument.

```js
class Selectors {
  /**
   * Select a single item by ID 
   */
  byId(state: IState, id: ID): T | void {}

  /**
   * Select all items from a branch
   * Returns an array of items.
   */
  all(state: IState): Items[] {}

  /**
   * Select items that meet a certain condition
   * Returns an array of items.
   */
  where(state: IState, condition: (item: ItemT<T>) => boolean): Items[] {}

  /**
   * Select all of the meta information, the top level
   * data stored alongside of items.
   * Returns an object containing the meta information.
   */
  meta(state: IState): { [key: string]: any } | void {}
}
```

## Adding Custom Selectors

To add custom selectors, import and extend the Selectors class and pass it to the StateBranch constructor. If you've already read the section on actions, this should look familiar.

```js
// state/todos/index.js

// import Selectors
import { StateBranch, Actions, Selectors } from 'redux-state-branch';

// Create Todo Selectors class
class TodosSelectors extends Selectors {
  // returns the current viewByFilter
  viewByFilter(state) {
    return this.meta(state).viewByFilter;
  }

  // returns top level loading
  loading(state) {
    return this.meta(state).loading;
  }

  // Show our visible todos
  visibleTodos(state) {
    const viewByFilter = this.viewByFilter(state);
    
    // run our where clause
    return this.where(state, todo => {
      switch (viewByFilter) {
        case 'todo':
          return !todo.isDone;
        case 'done':
          return todo.isDone;
        case 'low':
        case 'normal':
        case 'high':
          return todo.priority === viewByFilter;
        default:
          return true;
      }
    });
  }
}

class TodosActions extends Actions {
  ...
}

export const todosBranch = new StateBranch({ 
  name: 'todos',
  actions: TodosActions,
  // pass in our custom actions
  selectors: TodosSelectors,
  // default state and default item can be whatever we need
  // here we are adding loading and the concept of a viewByFilter.
  defaultState: {
    loading: false,
    viewByFilter: 'all',
    items: {
      '1': {
        id: '1',
        text: '',
        priority: 'normal',
        isDone: false
      }
    }
  },
  defaultItem: {
    text: '',
    priority: 'normal',
    isDone: false
  }
  ...
});
```


## Using Selectors
Any selector will now be available for use as `todosBranch.select.yourSelectorName`.

```jsx
import * as React from 'react';
import { connect } from 'react-redux';
import { todosBranch } from './state/todos';

// Back in your view where you are connecting your component to Redux.
const TodosExample = connect(
  state => ({
    // Select all Todos from the Todos branch
    all: todosBranch.select.all(state),
    // Select a specific todo
    todo: todosBranch.select.byId(state, 'my-id'),
    // Select the meta information
    meta: todosBranch.select.meta(state),
    // Select todos that meet a condition
    doneTodos: todosBranch.select.where(state, (todo) => !!todo.isDone),
    // Use your custom selectors
    visibleTodos: todosBranch.select.visibleTodos(state),
    isLoading: todosBranch.select.isLoading(state),
  }),
  dispatch => ({...})
)(TodosExample_);
```