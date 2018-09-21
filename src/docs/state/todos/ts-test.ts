import { Actions, Selectors, StateBranch } from "../../../redux-state-branch";

interface TodoT {
  id: string;
  text: string;
  priority: "normal";
  isDone: boolean;
}

interface TodoStateT {
  loading: boolean;
  viewByFilter: string;
  items: {
    [id: string]: TodoT;
  };
}

interface StateT {
  todos: TodoStateT;
}

class TodosSelectors extends Selectors<TodoT, TodoStateT> {
  viewByFilter(state: StateT) {
    return this.meta(state).viewByFilter;
  }

  loading(state: StateT) {
    return this.meta(state).loading;
  }

  visibleTodos(state: StateT, viewByFilter) {
    return this.where(state, todo => {
      switch (viewByFilter) {
        case "todo":
          return !todo.isDone;
        case "done":
          return todo.isDone;
        case "low":
        case "normal":
        case "high":
          return todo.priority === viewByFilter;
        default:
          return true;
      }
    });
  }
}

class TodosActions extends Actions<TodoT> {
  toggleDone(todoId, isDone) {
    // make sure we have a boolean
    return this.update({ id: todoId, isDone: !!isDone }, "isDone");
  }

  updateText(todoId, text) {
    // capitalize the first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return this.update({ id: todoId, text }, "text");
  }

  changePriority(todoId, priority) {
    if (!["low", "normal", "high"].includes(priority)) {
      throw new Error("Invalid Priority");
    }
    return this.update({ id: todoId, priority }, "priority");
  }

  updateViewByFilter(viewByFilter) {
    return this.setMeta({ viewByFilter }, "viewByFilter");
  }

  // Handling an Async action
  createTodo() {
    // Using redux thunk we get access to dispatch
    return dispatch => {
      dispatch(this.setMeta({ loading: true }, "loading"));

      // Fake an async call, IRL use fetch...
      dispatch(this.create());
      dispatch(this.setMeta({ loading: false }, "loading"));
    };
  }
}

export const todosBranch = new StateBranch({
  name: "todos",
  selectors: TodosSelectors,
  actions: TodosActions,
  defaultState: {
    loading: false,
    viewByFilter: "all",
    items: {
      "1": {
        id: "1",
        text: "",
        priority: "normal",
        isDone: false
      }
    }
  },
  defaultItem: {
    text: "",
    priority: "normal",
    isDone: false
  }
});

const state = {
  todos: {
    loading: false,
    viewByFilter: "all",
    items: {
      "1": {
        id: "1",
        text: "",
        priority: "normal",
        isDone: false
      }
    }
  }
};

// const a = todosBranch.select.byId(state, "1");
// const b = todosBranch.select.all(state);
// const c = todosBranch.select.where(state, () => true);
// const d = todosBranch.select.meta(state).loading;
