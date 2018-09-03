import {
  combineReducers,
  applyMiddleware,
  compose,
  createStore as reduxCreateStore
} from 'redux';

import thunk from 'redux-thunk';
import { todosBranch } from './todos/index.js';

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  [todosBranch.name]: todosBranch.reducer
});

const enhancer = composeEnhancers(applyMiddleware(thunk));

export const createStore = () => {
  return reduxCreateStore(rootReducer, enhancer);
};
