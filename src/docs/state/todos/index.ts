import { Actions, Selectors, StateBranch } from "../../../redux-state-branch";

export const todosBranch = new StateBranch({
  name: "todos",
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
  utils: {
    foo: () => {}
  },
  constants: {
    hello: "world"
  },
  defaultItem: {
    text: "",
    priority: "normal",
    isDone: false
  }
});

todosBranch.constant;
