import { Actions, Selectors, StateBranch } from '../../redux-state-branch';

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
  create() {
    // Using redux thunk we get access to dispatch
    return dispatch => {
      dispatch(this.setMeta({ loading: true }, 'loading'));

      // Fake an async call, IRL use fetch...
      setTimeout(() => {
        dispatch(super.create());
        dispatch(this.setMeta({ loading: false }, 'loading'));
      }, 2000);
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
