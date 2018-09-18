export const makeType = (prefix: string, suffix?: string) =>
  `${prefix}${suffix ? "/" + suffix : ""}`;

export const ensureArray = (items: any) =>
  Array.isArray(items) ? items : [items];

export type ItemT<T> = T & { id: string };

export type ItemsT<T> = T | T[];

export type ID = string;

export type ConstantsT<C> = {
  CREATE: string;
  REPLACE: string;
  UPDATE: string;
  DELETE: string;
  RESET: string;
  SET_META: string;
} & C;

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
  protected constant: ConstantsT<any>;

  constructor(constants: ConstantsT<any>) {
    this.constant = constants;
  }

  replace(items: ItemsT<T>, devToolsSuffix?: string) {
    return {
      type: makeType(this.constant.REPLACE, devToolsSuffix),
      items: ensureArray(items)
    };
  }

  delete(items: ItemsT<T> | ID | ID[], devToolsSuffix?: string) {
    const wrappedItems = !Array.isArray(items) ? [items] : items;

    return {
      type: makeType(this.constant.DELETE, devToolsSuffix),
      items: ensureArray(
        typeof wrappedItems[0] === "string"
          ? (wrappedItems as string[]).map((id: string) => ({ id }))
          : wrappedItems
      )
    };
  }

  create(items?: ItemsT<T>, devToolsSuffix?: string) {
    return {
      type: makeType(this.constant.CREATE, devToolsSuffix),
      items: ensureArray(items || {})
    };
  }

  update(items: ItemsT<T>, devToolsSuffix?: string) {
    return {
      type: makeType(this.constant.UPDATE, devToolsSuffix),
      items: ensureArray(items)
    };
  }

  setMeta(meta: { [key: string]: any }, devToolsSuffix?: string) {
    return {
      type: makeType(this.constant.SET_META, devToolsSuffix),
      meta
    };
  }

  reset(devToolsSuffix?: string) {
    return {
      type: makeType(this.constant.RESET, devToolsSuffix)
    };
  }
}

interface IStateBranchOpts<T, A, S, C, U> {
  name: string;
  actions?: new (constants: ConstantsT<C>) => A | Actions<T>;
  selectors?: new (name: string) => S | Selectors<T>;
  constants?: C;
  utils?: U;
  defaultItem?: { [key: string]: any };
  defaultState?: { [key: string]: any };
  reducer?: (state: IState, action: IAction<T>) => IState;
}

export class StateBranch<T, A, S, C, U> {
  name: string;

  constant: ConstantsT<C>;
  util: U;
  action: A | Actions<T>;
  select: S | Selectors<T>;
  defaultItem: { [key: string]: any };
  defaultState: { [key: string]: any };
  protected extendedReducer: (state: IState, action: IAction<T>) => IState;

  constructor({
    name,
    actions: ActionsConstructor = Actions,
    selectors: SelectorsConstructor = Selectors,
    // @ts-ignore
    constants = {},
    // @ts-ignore
    utils = {},
    defaultItem = {},
    defaultState = { items: {} },
    reducer = (state, action) => state
  }: IStateBranchOpts<T, A, S, C, U>) {
    this.name = name;

    this.constant = {
      // @ts-ignore
      ...constants,
      CREATE: `${name}/CREATE`,
      REPLACE: `${name}/REPLACE`,
      UPDATE: `${name}/UPDATE`,
      DELETE: `${name}/DELETE`,
      SET_META: `${name}/SET_META`,
      RESET: `${name}/RESET`
    };

    this.util = utils;

    this.action = new ActionsConstructor(this.constant);
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
      case this.constant.CREATE:
        const newCreateItems = items.reduce((acc, item: ItemT<T>) => {
          if (item.id === undefined) {
            if (action.type === this.constant.CREATE) {
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
      case this.constant.UPDATE:
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
      case this.constant.REPLACE:
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
      case this.constant.DELETE:
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
      case this.constant.SET_META:
        return {
          ...state,
          ...action.meta
        };
      case this.constant.RESET:
        return this.defaultState;
      default:
        return this.extendedReducer(state, action);
    }
  }
}
