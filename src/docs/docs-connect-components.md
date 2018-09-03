# Connect Components

You connect components with `redux-state-branch` exactly the same way as you do with normal redux. The exception is, instead of importing multiple actions and selectors, you just import your branch. This offers an increased amount of portability and convenience while still offering compile time safety if you're using Typescript or Flow.

```jsx
import * as React from 'react';
import { connect } from 'react-redux';
import { todosBranch } from './state/todos';

const TodosExample_ = ({
  all,
  todo,
  meta,
  doneTodos,
  visibleTodos,
  isLoading,
  createTodo,
  resetTodos,
  deleteTodo,
  updateTodoText,
  toggleTodoDone
}) => (
  <div className="todos-example">
    ...
  </div>
);

/**
 * Connect to your Redux Store
 */
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