export const makeType = (prefix: string, suffix?: string) =>
  `${prefix}${suffix ? "/" + suffix : ""}`;

export const ensureArray = (items: any) =>
  Array.isArray(items) ? items : [items];

export type ItemT<T> = T & { id: string };

export type ItemsT<T> = T | T[];

export type ID = string;

export interface IConstants {
  CREATE: string;
  REPLACE: string;
  UPDATE: string;
  DELETE: string;
  RESET: string;
  SET_META: string;
}

export interface IAction<T> {
  type: string;
  items: ItemsT<T>;
  meta: { [key: string]: any };
}

export interface IState {
  [key: string]: any;
}

export class Selectors<T> {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  byId(state: IState, id: ID): T | void {
    return state[this.name].items[id];
  }

  all(state: IState): T[] {
    return Object.values(state[this.name].items);
  }

  where(state: IState, condition: (item: ItemT<T>) => boolean): T[] {
    return this.all(state).filter(condition);
  }

  meta(state: IState): { [key: string]: any } | void {
    const { items, ...meta } = state[this.name];
    return meta;
  }
}

export class Actions<T> {
  protected constants: IConstants;

  constructor(constants: IConstants) {
    this.constants = constants;
  }

  replace(items: ItemsT<T>, devToolsSuffix?: string) {
    return {
      type: makeType(this.constants.REPLACE, devToolsSuffix),
      items: ensureArray(items)
    };
  }

  delete(items: ItemsT<T> | ID | ID[], devToolsSuffix?: string) {
    const wrappedItems = !Array.isArray(items) ? [items] : items;

    return {
      type: makeType(this.constants.DELETE, devToolsSuffix),
      items: ensureArray(
        typeof wrappedItems[0] === "string"
          ? (wrappedItems as string[]).map((id: string) => ({ id }))
          : wrappedItems
      )
    };
  }

  create(items?: ItemsT<T>, devToolsSuffix?: string) {
    return {
      type: makeType(this.constants.CREATE, devToolsSuffix),
      items: ensureArray(items || {})
    };
  }

  update(items: ItemsT<T>, devToolsSuffix?: string) {
    return {
      type: makeType(this.constants.UPDATE, devToolsSuffix),
      items: ensureArray(items)
    };
  }

  setMeta(meta: { [key: string]: any }, devToolsSuffix?: string) {
    return {
      type: makeType(this.constants.SET_META, devToolsSuffix),
      meta
    };
  }

  reset(devToolsSuffix?: string) {
    return {
      type: makeType(this.constants.RESET, devToolsSuffix)
    };
  }
}

interface IStateBranchOpts<T, A, S> {
  name: string;
  actions?: new (constants: IConstants) => A | Actions<T>;
  selectors?: new (name: string) => S | Selectors<T>;
  defaultItem?: { [key: string]: any };
  defaultState?: { [key: string]: any };
  reducer?: (state: IState, action: IAction<T>) => IState;
}

export class StateBranch<T, A, S> {
  name: string;

  constants: IConstants;
  action: A | Actions<T>;
  select: S | Selectors<T>;
  defaultItem: { [key: string]: any };
  defaultState: { [key: string]: any };
  protected extendedReducer: (state: IState, action: IAction<T>) => IState;

  constructor({
    name,
    actions: ActionsConstructor = Actions,
    selectors: SelectorsConstructor = Selectors,
    defaultItem = {},
    defaultState = { items: {} },
    reducer = (state, action) => state
  }: IStateBranchOpts<T, A, S>) {
    this.name = name;

    this.constants = {
      CREATE: `${name}/CREATE`,
      REPLACE: `${name}/REPLACE`,
      UPDATE: `${name}/UPDATE`,
      DELETE: `${name}/DELETE`,
      SET_META: `${name}/SET_META`,
      RESET: `${name}/RESET`
    };

    this.action = new ActionsConstructor(this.constants);
    this.select = new SelectorsConstructor(this.name);
    this.reducer = this.reducer.bind(this);
    this.defaultItem = defaultItem;
    this.defaultState = defaultState;
    this.extendedReducer = reducer;
  }

  reducer(state: IState = this.defaultState, action: IAction<T>) {
    const items = ensureArray(action.items);
    const type = action.type.split("/", 2).join("/");

    switch (type) {
      case this.constants.CREATE:
        const newCreateItems = items.reduce((acc, item: ItemT<T>) => {
          if (item.id === undefined) {
            if (action.type === this.constants.CREATE) {
              item.id = `-${Math.random()
                .toString(16)
                .slice(2)}`;
            }
          }

          acc[item.id] = {
            ...this.defaultItem,
            ...(item as any)
          };
          return acc;
        }, {});

        return {
          ...state,
          items: {
            ...state.items,
            ...newCreateItems
          }
        };
      case this.constants.UPDATE:
        const newUpdateItems = items.reduce((acc, item: ItemT<T>) => {
          acc[item.id] = {
            ...(state.items[item.id] || {}),
            ...(item as any)
          };
          return acc;
        }, {});

        return {
          ...state,
          items: {
            ...state.items,
            ...newUpdateItems
          }
        };
      case this.constants.REPLACE:
        const newReplaceItems = items.reduce((acc, item: ItemT<T>) => {
          acc[item.id] = item;
          return acc;
        }, {});

        return {
          ...state,
          items: {
            ...state.items,
            ...newReplaceItems
          }
        };
      case this.constants.DELETE:
        const newDeleteItems = items.reduce(
          (acc, item: ItemT<T>) => {
            delete acc[item.id];
            return acc;
          },
          { ...state.items }
        );

        return {
          ...state,
          items: newDeleteItems
        };
      case this.constants.SET_META:
        return {
          ...state,
          ...action.meta
        };
      case this.constants.RESET:
        return this.defaultState;
      default:
        return this.extendedReducer(state, action);
    }
  }
}
