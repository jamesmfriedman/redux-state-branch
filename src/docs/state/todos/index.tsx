import {
  createActions,
  createSelectors,
  stateBranch
} from 'redux-state-branch';
import { StateT } from '..';
import { Dispatch } from 'redux';

export type TodoT = {
  id: string;
  text: string;
  priority: 'low' | 'medium' | 'high';
  isDone: boolean;
};

export type TodoStateT = {
  loading: boolean;
  viewByFilter: 'todo' | 'done' | 'low' | 'normal' | 'high';
  items: { [id: string]: TodoT };
};

const name = 'todos';

/*******************************************
 * Selectors
 *******************************************/

const selectors = createSelectors({ name });
const { meta, where } = selectors;

const customSelectors = {
  viewByFilter: (state: StateT) => {
    return meta(state).viewByFilter;
  },

  loading: (state: StateT) => {
    return meta(state).loading;
  },
  visibleTodos: (state: StateT, viewByFilter: TodoStateT['viewByFilter']) => {
    return where(state, {
      callback: todo => {
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
      }
    });
  }
};

/*******************************************
 * Actions
 *******************************************/

const actions = createActions({ name });
const { update, setMeta, create } = actions;

const customActions = {
  toggleDone: (todoId: string, isDone: boolean) => {
    // make sure we have a boolean
    return update({ id: todoId, isDone: !!isDone }, 'isDone');
  },

  updateText: (todoId: string, text: string) => {
    // capitalize the first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return update({ id: todoId, text }, 'text');
  },

  changePriority: (todoId: string, priority: string) => {
    if (!['low', 'normal', 'high'].includes(priority)) {
      throw new Error('Invalid Priority');
    }
    return update({ id: todoId, priority }, 'priority');
  },

  updateViewByFilter: (viewByFilter: TodoStateT['viewByFilter']) => {
    return setMeta({ viewByFilter }, 'viewByFilter');
  },

  // Handling an Async action
  createTodo: () => {
    // Using redux thunk we get access to dispatch
    return (dispatch: Dispatch) => {
      dispatch(setMeta({ loading: true }, 'loading'));

      // Fake an async call, IRL use fetch...
      dispatch(create());
      dispatch(setMeta({ loading: false }, 'loading'));
    };
  }
};

export const todosBranch = stateBranch()({
  name,
  selectors: {
    ...selectors,
    ...customSelectors
  },
  actions: {
    ...actions,
    ...customActions
  },
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
  }
});
