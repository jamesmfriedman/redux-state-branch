import { Actions, Selectors, StateBranch } from '../../redux-state-branch';

export const todosBranch = new StateBranch({
  name: 'todos',
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
