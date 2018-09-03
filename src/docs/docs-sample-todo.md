# Sample Todo App

## Todos Branch
```js
// state/todos/index.js
import { Actions, Selectors, StateBranch } from 'redux-state-branch';

class TodosSelectors extends Selectors {
  viewByFilter(state) {
    return this.meta(state).viewByFilter;
  }

  loading(state) {
    return this.meta(state).loading;
  }

  visibleTodos(state, viewByFilter) {
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
  toggleDone(todoId, isDone) {
    // make sure we have a boolean
    return this.update({ id: todoId, isDone: !!isDone }, 'isDone');
  }

  updateText(todoId, text) {
    // capitalize the first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return this.update({ id: todoId, text }, 'text');
  }

  changePriority(todoId, priority) {
    if (!['low', 'normal', 'high'].includes(priority)) {
      throw new Error('Invalid Priority');
    }
    return this.update({ id: todoId, priority }, 'priority');
  }

  updateViewByFilter(viewByFilter) {
    return this.setMeta({ viewByFilter }, 'viewByFilter');
  }

  // Handling an Async action
  createTodo() {
    // Using redux thunk we get access to dispatch
    return dispatch => {
      dispatch(this.setMeta({ loading: true }, 'loading'));

      // Fake an async call, IRL use fetch...
      dispatch(this.create());
      dispatch(this.setMeta({ loading: false }, 'loading'));
    };
  }
}

export const todosBranch = new StateBranch({
  name: 'todos',
  selectors: TodosSelectors,
  actions: TodosActions,
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
});
```

## Redux Store
```js
// state/store.js
import {
  combineReducers,
  applyMiddleware,
  compose,
  createStore as reduxCreateStore
} from 'redux';

import thunk from 'redux-thunk';
import { todosBranch } from './todos/index.js';

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  [todosBranch.name]: todosBranch.reducer
});

const enhancer = composeEnhancers(applyMiddleware(thunk));

export const createStore = () => {
  return reduxCreateStore(rootReducer, enhancer);
};
```

## App Component

```jsx
// app.js
import * as React from 'react';
import { connect } from 'react-redux';
import './App.css';

import { todosBranch } from './state/todos/index.js';

class App extends React.Component {
  render() {
    const {
      todos,
      viewByFilter,
      createTodo,
      resetTodos,
      changePriority,
      toggleDone,
      updateText,
      isLoading,
      updateViewByFilter
    } = this.props;

    return (
      <div className="App">
        <button onClick={createTodo} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'New Todo'}
        </button>
        <button onClick={resetTodos}>Reset All</button>

        <label>
          Filter
          <select
            value={viewByFilter}
            onChange={evt => updateViewByFilter(evt.target.value)}
          >
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="done">Done</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>

        <ul>
          {todos.map(todo => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.isDone}
                onChange={evt => toggleDone(todo.id, evt.target.checked)}
              />
              <input
                placeholder="Write something..."
                value={todo.text}
                onChange={evt => updateText(todo.id, evt.target.value)}
              />
              <select
                value={todo.priority}
                onChange={evt => changePriority(todo.id, evt.target.value)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default connect(
  state => {
    const viewByFilter = todosBranch.select.viewByFilter(state);
    const todos = todosBranch.select.visibleTodos(state, viewByFilter);
    const isLoading = todosBranch.select.loading(state);

    return {
      todos,
      viewByFilter,
      isLoading
    };
  },
  dispatch => ({
    updateViewByFilter: viewByFilter =>
      dispatch(todosBranch.action.updateViewByFilter(viewByFilter)),
    toggleDone: (todoId, isDone) =>
      dispatch(todosBranch.action.toggleDone(todoId, isDone)),
    updateText: (todoId, text) =>
      dispatch(todosBranch.action.updateText(todoId, text)),
    changePriority: (todoId, priority) =>
      dispatch(todosBranch.action.changePriority(todoId, priority)),
    createTodo: () => dispatch(todosBranch.action.create()),
    resetTodos: () => dispatch(todosBranch.action.reset())
  })
)(App);

```