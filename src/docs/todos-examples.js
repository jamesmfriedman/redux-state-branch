import * as React from 'react';
import { connect } from 'react-redux';
import { todosBranch } from './state/todos/index.js';
import { Button } from 'rmwc/Button';
import { Checkbox } from 'rmwc/Checkbox';
import { IconButton } from 'rmwc/IconButton';
import { TextField } from 'rmwc/TextField';

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
          onChange={evt => updateTodo({ id: todo.id, text: evt.target.value })}
        />
        <button onClick={() => deleteTodo(todo)}>&times;</button>
      </div>
    ))}
  </div>
);

/**
 * Connect to your Redux Store
 */
export const TodosExample = connect(
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
