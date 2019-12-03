# Sample Todo App

The code below is a representative example of what a working todo app would look like using Redux StateBranch. In less than 250 lines of code, you have a type safe todo app backed by Redux.

## Todos Branch

`state/todos/index.tsx`
```jsx
import { createActions, createSelectors, stateBranch } from 'redux-state-branch';

export type TodoT = {
  id: string;
  priority: 'low' | 'medium' | 'high'
  isDone: boolean;
  text: '';
};

export type TodoStateT = {
  loading: boolean;
  viewByFilter: 'todo' | 'done' | 'low' | 'normal' | 'high';
  items: { [id: string]: TodoT };
};

const name = 'todos';

const defaultItem: Partial<TodoT> = {
  text: '',
  priority: 'normal',
  isDone: false
};

const defaultState: TodoStateT = {
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
};

/**************************************
 * Selectors
 **************************************/
const selectors = createSelectors({name})

const customSelectors = {
  viewByFilter: (state) => {
    return selectors.meta(state).viewByFilter;
  },

  loading: (state) => {
    return selectors.meta(state).loading;
  },

  visibleTodos: (state, viewByFilter) => {
    return selectors.where(state, todo => {
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
};

/**************************************
 * Actions
 **************************************/
const actions = createActions({name, defaultItem});

const customActions = {
  toggleDone: (todoId, isDone) => {
    // make sure we have a boolean
    return actions.update({ id: todoId, isDone: !!isDone }, 'isDone');
  },

  updateText: (todoId, text) => {
    // capitalize the first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return actions.update({ id: todoId, text }, 'text');
  },

  changePriority: (todoId, priority) => {
    if (!['low', 'normal', 'high'].includes(priority)) {
      throw new Error('Invalid Priority');
    }
    return actions.update({ id: todoId, priority }, 'priority');
  },

  updateViewByFilter: (viewByFilter) => {
    return actions.setMeta({ viewByFilter }, 'viewByFilter');
  },

  // Handling an Async action
  createTodo: () => {
    // Using redux thunk we get access to dispatch
    return dispatch => {
      dispatch(actions.setMeta({ loading: true }, 'loading'));

      // Fake an async call, IRL use fetch...
      dispatch(actions.create());
      dispatch(actions.setMeta({ loading: false }, 'loading'));
    };
  }
}

/**************************************
 * Branch
 **************************************/
export const todosBranch = stateBranch<TodoT, TodoStateT>()({
  name,
  selectors: {
    ...customSelectors,
    ...selectors
  },
  actions: : {
    ...customActions,
    ...actions
  },
  defaultState,
  defaultItem
});
```

## Redux Store
`state/store.tsx`
```jsx
import { createStore } from 'redux-state-branch';
import thunk from 'redux-thunk';
import { todosBranch } from './todos/index.js';

export const store = createStore({
  devTools: true,
  middleware: [thunk],
  reducers: {
    [todosBranch.name]: todosBranch.reducer
  }
});
```

## App Component

`app.tsx`
```jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './App.css';

import { todosBranch } from './state/todos/index.js';

function App() {
  const dispatch = useDispatch();

  const viewByFilter = useSelector(state => todosBranch.select.viewByFilter(state));
  const todos = useSelector(state => todosBranch.select.visibleTodos(state, viewByFilter));
  const isLoading = useSelector(state => todosBranch.select.loading(state));

  const updateViewByFilter = viewByFilter =>
      dispatch(todosBranch.action.updateViewByFilter(viewByFilter));
  
  const toggleDone = (todoId, isDone) =>
      dispatch(todosBranch.action.toggleDone(todoId, isDone));
  
  const updateText = (todoId, text) => dispatch(todosBranch.action.updateText(todoId, text));
  
  const changePriority = (todoId, priority) =>
      dispatch(todosBranch.action.changePriority(todoId, priority));
  
  const createTodo = () => dispatch(todosBranch.action.create());
    
  const resetTodos = () => dispatch(todosBranch.action.reset());

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
```