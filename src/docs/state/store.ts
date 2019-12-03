import { createStore } from 'redux-state-branch';
import thunk from 'redux-thunk';
import { todosBranch } from './todos';

export const store = createStore({
  devTools: true,
  middleware: [thunk],
  reducers: {
    [todosBranch.name]: todosBranch.reducer
  }
});
