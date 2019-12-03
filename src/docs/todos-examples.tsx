import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { todosBranch, TodoT } from './state/todos';

// UI Components
import { Button } from '@rmwc/button';
import { Checkbox } from '@rmwc/checkbox';
import { IconButton } from '@rmwc/icon-button';
import { TextField } from '@rmwc/textfield';

/**
 * An example component showing a simple todo App.
 */
export function TodosExample() {
  // Select all Todos from the Todos branch
  const todos = useSelector(state => todosBranch.select.all(state));

  const dispatch = useDispatch();
  const updateTodo = (todo: Partial<TodoT>) =>
    dispatch(todosBranch.action.update(todo));
  const createTodo = () => dispatch(todosBranch.action.create());
  const resetTodos = () => dispatch(todosBranch.action.reset());
  const removeTodo = (todo: Partial<TodoT>) =>
    dispatch(todosBranch.action.remove(todo));

  return (
    <div className="todos-example">
      <Button onClick={createTodo}>New Todo</Button>
      <Button onClick={resetTodos}>Reset</Button>

      {todos.map(todo => (
        <div key={todo.id}>
          <Checkbox
            checked={todo.isDone}
            onChange={evt =>
              // You don't have to pass around the whole todo object, just the things you want to update and the ID.
              updateTodo({ id: todo.id, isDone: evt.currentTarget.checked })
            }
          />
          <TextField
            placeholder="Write something..."
            value={todo.text}
            onChange={evt =>
              updateTodo({ id: todo.id, text: evt.currentTarget.value })
            }
          />
          <IconButton onClick={() => removeTodo(todo)}>&times;</IconButton>
        </div>
      ))}
    </div>
  );
}
