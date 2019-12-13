# Actions

Action creators are functions that create action objects that are dispatched to your reducers.

## Using Actions

Redux StateBranch comes with action creator primitives that you can use to take CRUD like actions on your reducer. You should have already seen some of these methods used in the previous [Branches example](./branches).

```jsx
import { todosBranch } from 'state/todos'; 
import { resetAllBranches } from 'redux-state-branch';

function TodosExample() {
  const dispatch = useDispatch();

  // Create a new todo
  // This will autogenerate a uuid for the 'id' property if id is not specified
  const createTodo = () => dispatch(todosBranch.action.create({text: 'Hello World'}));

  // Update a todo based on its id
  // This will shallowly merge in updates over the existing todo
  // It will also create the todo in the event it doesn't exist
  const updateTodo = () => dispatch(todosBranch.action.update({id: 'myTodoId', text: 'Change the text to this', iDone: true}));

  // Remove this todo
  const removeTodo = () => dispatch(todosBranch.action.remove({id: 'myTodoId'}));
  // Or remove by id only
  const removeTodoAlt = () => dispatch(todosBranch.action.remove('myTodoId'));

  // Replace an existing todo with this id with the new object
  const replaceTodo = () => dispatch(todosBranch.action.replace({id: 'myTodoId', text: 'Replace me', isDone: false, priority: 'low'}));

  // Sets a top level property, anything thats not an "item"
  const setLoading = () =>  dispatch(todosBranch.action.setMeta({loading: true}));

  // Resets the entire todos reducer to its initial state
  const reset = () => dispatch(todosBranch.action.reset());

  // Does absolutely nothing... Useful for side effects in epics / sagas that end up not impacting the store
  const noop = () => dispatch(todosBranch.action.noop());

  // Special action creator, will reset ALL state branches to their initial state
  const resetAll = () => dispatch(resetAllBranches())
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

## Working with multiple items

Create, update, remove, and replace all handle a single item or an array of items.

```jsx
function TodosExample() {
  const dispatch = useDispatch();

  // Create 3 new todos
  dispatch(todosBranch.action.create([
    {id: '1' text: 'Todo 1'},
    {id: '2' text: 'Todo 2'},
    {id: '3' text: 'Todo 3'}
  ]))

  // Mark all of the todos as done
  dispatch(todosBranch.action.update([
    {id: '1', isDone: true},
    {id: '2', isDone: true},
    {id: '3', isDone: true'}
  ]))
}
```



## Adding Custom Actions

You could build an entire app using the included primitives, but you'll likely want to be more specific in how you handle your state and actions. You can make easily make custom actions while still leveraging the built in primitives.


`state/todos/index.tsx`
```jsx
// import createActions
import { stateBranch, createActions } from 'redux-state-branch';

const name = 'todos'

// Create the basic actions
const actions = createActions<TodoT, TodoStateT>({name});

// Define our custom actions
const customActions = {
  toggleDone: (todoId: string, isDone: boolean) => {
    // an example sanitizing isDone to make sure it's a boolean
    // and adding a last modified timestamp
    return actions.update({ id: todoId, isDone: !!isDone, lastModified: Date.now() });
  },
  updateText: (todoId: string, text: string) => {
    // capitalize the first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    // Call update. We can optionally pass a string suffix
    // that will show up in our devTools
    return actions.update({ id: todoId, text }, 'updateText');
  }
}

export const todosBranch = stateBranch()({ 
  name,
  // Pass in our custom actions
  actions: {
    ...customActions,
    ...actions
  }
  ...
});

// Your actions will be available now under `todosBranch.action.yourActionName`
todosBranch.action.toggleDone('myTodoId', true);
```

## Async Actions

Most apps are going to have some communication with a backend. Redux StateBranch works with any async middleware/ The following example uses `redux-thunk` since it's one of easiest patterns to understand. Make sure you have `redux-thunk` installed and setup correctly and then you can add async actions as follows:

`state/todos/index.tsx`
```jsx
// import createActions
import { stateBranch, createActions } from 'redux-state-branch';

const name = 'todos'

// Create the basic actions
const actions = createActions({name});

// Define our custom actions
const customActions = {
  // An Async action that updates the local store optimistically
  // and makes a call to a server
  changeOwner: (todoId: string, ownerId: string) => {
    return async (dispatch) => {
      // Optimistically update our todo
      dispatch(actions.update({
        id: todoId, 
        ownerId
      }))

      // call our server
      await fetch('/updateTodoOwner', ...yourFetchOptions);
    }
  },

  // An async action that creates
  createNewTodo(todoData) {
    return async (dispatch) => {
      // call our server
      const todo = await fetch('/createTodo', ...yourFetchOptions);
      
      // create our todo in the store
      dispatch(actions.create(todo))
    }
  }
}

export const todosBranch = stateBranch()({ 
  name,
  // Pass in our custom actions
  actions: {
    ...customActions,
    ...actions
  }
  ...
});
```

You can use the same action creators inside or redux-observable, epics, sagas, and anything else. These all generate actions with constants for the types which you can listen to. Look at your Redux dev tools for a better understanding of what actions Redux StateBranch creates.

```jsx
dispatch(todosBranch.action.create({...}, 'myCustomSuffix'))

// Generates an action with the following format:
{type: 'todos/CREATE/myCustomSuffix', items: [...]}
```