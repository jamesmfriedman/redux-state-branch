# Selectors

Selectors are the equivalent of queries for Redux. They are the best way to keep the shape of your state separate from the shape of your apps view logic. Redux StateBranch comes with some built in selectors that you can leverage to build more of your own. 

## Using Selectors
Redux StateBranch comes with a handful of selector primitives to help get data out of your state. Any selector is available for use as `todosBranch.select.yourSelectorName`.

```jsx
import { todosBranch } from 'state/todos'; 
import { resetAllBranches } from 'redux-state-branch';

function TodosExample() {
  // all: Select all todos from the branch as an array
  const allTodos = useSelector(state => todosBranch.select.all(state));
    
  // byId: Select a specific todo
  const specificTodo = useSelector(state => todosBranch.select.byId(state, {id: 'myTodoId'}));

  // byIds: The same idea as byId, but select multiple.
  // returns
  // {
  //  '1': {id: '1', text: 'hello', priority: 'low'}
  //  '2': {id: '2', text: 'another todo', priority: 'low'}
  // }
  const specificTodos = useSelector(state => todosBranch.select.byIds(state, {ids: ['1', '2']}));

  // where: Select todos that meet a condition as an array
  const doneTodos = useSelector(state => todosBranch.select.where(state, {callback: (todo) => !!todo.isDone})),
  
  // mapById: Get a map of all ids to all items
  // returns
  // {
  //  '1': {id: '1', text: 'hello', priority: 'low'}
  //  '2': {id: '2', text: 'another todo', priority: 'low'}
  // }
  const todosMap = useSelector(state => todosBranch.select.mapById(state));

  // mapByKey: Get a map of a subkey value to an array of matching items
  // returns
  // {
  //  'low': [{id: '1', text: 'hello', priority: 'low'}, {id: '2', priority: 'low', ...}],
  //  'medium': [{id: '1', text: 'hello', priority: 'medium'}, {id: '2', priority: 'medium', ...}],
  //  ...
  // }
  const todosMap = useSelector(state => todosBranch.select.mapByKey(state, {key: 'priority'}));

  // Select the meta (top level) data
  // returns {loading: true, viewByFilter: 'todo'}
  const meta = useSelector(state => todosBranch.select.meta(state));
}

// The above examples based on these type structures
// Including them here for reference
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
```

## Adding Custom Selectors

You could build an entire app using the included primitives, but you'll likely want to be more specific in how you handle getting data out of your state. You can make easily make custom selectors while still leveraging the built in primitives.

`state/todos/index.tsx`
```js
// import Selectors
import { stateBranch, createSelectors } from 'redux-state-branch';

const name = 'todos';

// Create base selectors
const selectors = createSelectors<TodoT, TodoStateT>({name});

// defined out here for reuse
// returns the current viewByFilter
const viewByFilter = (state) => {
  return selectors.meta(state).viewByFilter;
};

// Create custom selectors
const customSelectors = {
  viewByFilter,

  // returns top level loading property
  isLoading: (state) => {
    return selectors.meta(state).loading;
  },

  // Select only visible todos
  visibleTodos: (state) => {
    const currentViewFilter = viewByFilter(state);
    
    // run our where clause
    return selectors.where(state, { callback: todo => {
      switch (currentViewFilter) {
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
    }});
  }
}

export const todosBranch = stateBranch()({ 
  name: 'todos',
  // pass in our custom selectors
  selectors: {
    ...customSelectors,
    ...selectors
  },
  ...
});

// Your selectors will be available now under `todosBranch.select.yourSelectorName`
todosBranch.select.visibleTodos(state);
```


## Usage with Reselect
[Reselect](https://github.com/reduxjs/reselect) is a massively popular library for memoizing redux selectors. Using Reselect with Redux StateBranch works out of the box. Make sure `reselect` is installed and you're good to go.

```js
// import reselect
import { createSelector } from 'reselect;
import { stateBranch, createSelectors } from 'redux-state-branch';

const name = 'todos';

const selectors = createSelectors({name});

const viewByFilter = (state) => {
  return selectors.meta(state).viewByFilter;
};

const customSelectors = {
  viewByFilter,

  // Adding in createSelector for memoization
  // and refactoring so that it only recomputes when viewByFilter or todos change
  visibleTodos: createSelector(selectors.all, viewByFilter, (allTodos, currentViewFilter) => {
    return allTodos.filter(todo => {
      switch (currentViewFilter) {
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

export const todosBranch = stateBranch()({ 
  name: 'todos',
  // pass in our custom selectors
  selectors: {
    ...customSelectors,
    ...selectors
  },
  ...
});
```