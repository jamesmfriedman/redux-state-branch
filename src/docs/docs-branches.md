# Branches

A branch is just a piece of your state tree that encapsulates your data and logic. It makes only a handful of assumptions:

- You'll be dealing with lists of items. i.e. Users, Projects, Todos, Widgets, etc.
- All items will have an `id`.
- The branch contains an object called items which is a mapping of ids to items.

## Create a Branch
Creating new branches is easy.
Make a new file at `state/todos/index.tsx`;
```ts
import { stateBranch } from 'redux-state-branch';

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

export const todosBranch = stateBranch<TodoT, TodoStateT>()({
  // name our branch
  name: 'todos',
  
  // Optional. What does the default state look like? 
  // This can be anything you want. Don't forget to include `items`.
  defaultState: {
    loading: false,
    viewByFilter: 'all',
    items: {}
  },
});
```

## Add to Store
Add your newly created branch to your rootReducer.

```js
// state/store.js
import { createStore } from 'redux-state-branch';
import { todosBranch } from './todos';

export const store = createStore({
  devTools: true,
  reducers: {
    [todosBranch.name]: todosBranch.reducer
  }
});

```

## What did we get?
A lot actually. With that little bit of setup, we can build a fully functional todo app.

We connect our store to redux like we normally would and dispatch actions. The difference here is that we import `todosBranch` where we can do CRUD actions using its selectors and actions.

```jsx renderOnly
import { TodosExample } from './todos-examples'
<TodosExample />
```

```jsx
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

```

## Whats next?
While this example is simplistic, it puts too much business logic in the view. Next we'll look into adding our own custom actions that will be more powerful and keep the business logic higher up in the app with our state branch.