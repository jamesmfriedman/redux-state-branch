import * as React from 'react';
import { connect } from 'react-redux';
import './App.css';

import { todosBranch } from './state/todos/index.js';

class App extends React.Component {
  render() {
    const {
      todos,
      todosMeta,
      createTodo,
      updateTodo,
      resetTodos,
      updateTodosMeta
    } = this.props;

    return (
      <div className="App">
        <button onClick={createTodo}>New Todo</button>
        <button onClick={resetTodos}>Reset All</button>

        <label>
          Filter
          <select
            value={todosMeta.viewByFilter}
            onChange={evt =>
              updateTodosMeta({ viewByFilter: evt.target.value })
            }
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
                onChange={evt =>
                  updateTodo({ id: todo.id, isDone: evt.target.checked })
                }
              />
              <input
                placeholder="Write something..."
                value={todo.text}
                onChange={evt =>
                  updateTodo({ id: todo.id, text: evt.target.value })
                }
              />
              <select
                value={todo.priority}
                onChange={evt =>
                  updateTodo({ id: todo.id, priority: evt.target.value })
                }
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
    const todosMeta = todosBranch.select.meta(state);
    const todos = todosBranch.select.where(state, todo => {
      switch (todosMeta.viewByFilter) {
        case 'todo':
          return !todo.isDone;
        case 'done':
          return todo.isDone;
        case 'low':
        case 'normal':
        case 'high':
          return todo.priority === todosMeta.viewByFilter;
        default:
          return true;
      }
    });

    return {
      todos,
      todosMeta
    };
  },
  dispatch => ({
    updateTodosMeta: meta => dispatch(todosBranch.action.setMeta(meta)),
    updateTodo: todo => dispatch(todosBranch.action.update(todo)),
    createTodo: () => dispatch(todosBranch.action.create()),
    resetTodos: () => dispatch(todosBranch.action.reset())
  })
)(App);
