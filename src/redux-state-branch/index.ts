export const makeType = (prefix: string, suffix?: string) =>
  `${prefix}${suffix ? "/" + suffix : ""}`;

export const ensureArray = (items: any) =>
  Array.isArray(items) ? items : [items];

export interface MapT {
  [key: string]: any;
}

export type ItemT<T> = T & { id: string };

export type ItemsT<T> = Partial<T> | Array<Partial<T>>;

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
  meta: MapT;
}

export interface IState {
  [key: string]: any;
}

export class Selectors<T, BranchT> {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  byId<StateT>(state: StateT, id?: ID): T | void {
    return state[this.name].items[id || ""];
  }

  all<StateT>(state: StateT): T[] {
    return Object.values(state[this.name].items);
  }

  where<StateT>(state: StateT, condition: (item: ItemT<T>) => boolean): T[] {
    return this.all(state).filter(condition);
  }

  meta<StateT>(state: StateT): BranchT {
    return state[this.name];
  }
}

export class Actions<T> {
  protected constant: ConstantsT<any>;
  protected defaultItem: any;

  constructor(constants: ConstantsT<any>, defaultItem: any) {
    this.constant = constants;
    this.defaultItem = defaultItem;
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
    const newCreateItems = ensureArray(items || {}).map((item: ItemT<T>) => {
      if (item.id === undefined) {
        item.id = `-${Math.random()
          .toString(16)
          .slice(2)}`;
      }

      return {
        ...this.defaultItem,
        ...(item as any)
      };
    });

    return {
      type: makeType(this.constant.CREATE, devToolsSuffix),
      items: newCreateItems
    };
  }

  update(items: ItemsT<T>, devToolsSuffix?: string) {
    return {
      type: makeType(this.constant.UPDATE, devToolsSuffix),
      items: ensureArray(items)
    };
  }

  setMeta(meta: MapT, devToolsSuffix?: string) {
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

interface IStateBranchOpts<T, A, S, C, U, B> {
  name: string;
  actions?: new (constants: ConstantsT<C>, defaultItem: MapT) => A | Actions<T>;
  selectors?: new (name: string) => S | Selectors<T, B>;
  constants?: C;
  utils?: U;
  defaultItem?: MapT;
  defaultState?: MapT;
  reducer?: (state: IState, action: IAction<T>) => IState;
}

export class StateBranch<T, A, S, C, U, B> {
  name: string;

  constant: ConstantsT<C>;
  util: U;
  action: A | Actions<T>;
  select: S | Selectors<T, B>;
  defaultItem: MapT;
  defaultState: MapT;
  protected extendedReducer: (state: IState, action: IAction<T>) => IState;

  constructor({
    name,
    actions: ActionsConstructor = Actions,
    selectors: SelectorsConstructor = Selectors,
    constants,
    utils,
    defaultItem = {},
    defaultState = { items: {} },
    reducer = (state, action) => state
  }: IStateBranchOpts<T, A, S, C, U, B>) {
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
    // @ts-ignore
    this.util = utils;

    this.defaultItem = defaultItem;
    this.reducer = this.reducer.bind(this);
    this.defaultState = defaultState;
    this.extendedReducer = reducer;
    this.action = new ActionsConstructor(this.constant, this.defaultItem);
    this.select = new SelectorsConstructor(this.name);
  }

  reducer(state: IState = this.defaultState, action: IAction<T>) {
    const items = ensureArray(action.items);
    const type = action.type.split("/", 2).join("/");

    switch (type) {
      case this.constant.CREATE:
        return {
          ...state,
          items: {
            ...state.items,
            ...items
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
