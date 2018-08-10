import * as React from 'react';
import { connect } from 'react-redux';
import './App.css';

import logo from './logo.svg';
import { todosBranch } from './state/todos/index.js';

class App extends React.Component {
  render() {
    const {
      todos,
      viewByFilter,
      createTodo,
      resetTodos,
      changePriority,
      toggleDone,
      updateText,
      isLoading,
      updateViewByFilter
    } = this.props;

    return (
      <div className="App">
        <button onClick={createTodo} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'New Todo'}
        </button>
        <button onClick={resetTodos}>Reset All</button>

        <label>
          Filter
          <select
            value={viewByFilter}
            onChange={evt => updateViewByFilter(evt.target.value)}
          >
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="done">Done</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>

        <ul>
          {todos.map(todo => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.isDone}
                onChange={evt => toggleDone(todo.id, evt.target.checked)}
              />
              <input
                placeholder="Write something..."
                value={todo.text}
                onChange={evt => updateText(todo.id, evt.target.value)}
              />
              <select
                value={todo.priority}
                onChange={evt => changePriority(todo.id, evt.target.value)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default connect(
  state => {
    const viewByFilter = todosBranch.select.viewByFilter(state);
    const todos = todosBranch.select.visibleTodos(state, viewByFilter);
    const isLoading = todosBranch.select.loading(state);

    return {
      todos,
      viewByFilter,
      isLoading
    };
  },
  dispatch => ({
    updateViewByFilter: viewByFilter =>
      dispatch(todosBranch.action.updateViewByFilter(viewByFilter)),
    toggleDone: (todoId, isDone) =>
      dispatch(todosBranch.action.toggleDone(todoId, isDone)),
    updateText: (todoId, text) =>
      dispatch(todosBranch.action.updateText(todoId, text)),
    changePriority: (todoId, priority) =>
      dispatch(todosBranch.action.changePriority(todoId, priority)),
    createTodo: () => dispatch(todosBranch.action.create()),
    resetTodos: () => dispatch(todosBranch.action.reset())
  })
)(App);
