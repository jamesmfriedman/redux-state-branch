interface AnyAction<T = any> {
  type: T;
  // Allows any extra properties to be defined in an action.
  [extraProps: string]: any;
}

export interface AnyItem {
  id: string;
  // Allows any extra properties to be defined in an action.
  [extraProps: string]: any;
}

export type ItemsT<T> = Partial<T> | Array<Partial<T>>;

export interface StateBranchAction<ItemT, BranchStateT> extends AnyAction {
  items: { [key: string]: ItemT };
  meta: BranchStateT;
}

export interface Constants {
  CREATE: string;
  REPLACE: string;
  UPDATE: string;
  REMOVE: string;
  RESET: string;
  SET_META: string;
}

export interface State<Item> {
  items: { [key: string]: Item };
  [key: string]: any;
}

type PartialWithId<T> = Partial<T> & { id: string };

/**
 * Constants
 */
const RESET_ALL = 'RESET_ALL_BRANCHES';

/**
 * Utils
 */
const makeType = (prefix: string, suffix?: string) =>
  `${prefix}${suffix ? '/' + suffix : ''}`;

const ensureArray = <T>(items: any): PartialWithId<T>[] =>
  Array.isArray(items) ? items : [items];

const generateId = (): string => {
  return ([1e7].toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c: any) =>
      (
        c ^
        (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
  );
};

const constantsFactory = (name: string): Constants => ({
  CREATE: `${name}/CREATE`,
  REPLACE: `${name}/REPLACE`,
  UPDATE: `${name}/UPDATE`,
  REMOVE: `${name}/REMOVE`,
  SET_META: `${name}/SET_META`,
  RESET: `${name}/RESET`
});

/**
 * Selectors
 */

export const selectorsFactory = <
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
>(
  branchName: string
) => {
  const all = <StateT>(state: StateT): ItemT[] => {
    return Object.values(state[branchName].items);
  };

  return {
    all,
    byId: <StateT>(state: StateT, id?: string | null): ItemT | undefined => {
      return state[branchName].items[id || ''];
    },
    where: <StateT>(
      state: StateT,
      condition: (item: ItemT) => boolean
    ): ItemT[] => {
      return all(state).filter(condition);
    },
    meta: <StateT>(state: StateT): BranchStateT => {
      return state[branchName];
    }
  };
};

export class Selectors<
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
> {
  protected branchName: string;
  all: <StateT>(state: StateT) => ItemT[];
  byId: <StateT>(state: StateT, id?: string | null) => ItemT | undefined;
  where: <StateT>(
    state: StateT,
    condition: (item: ItemT) => boolean
  ) => ItemT[];
  meta: <StateT>(state: StateT) => BranchStateT;

  constructor(branchName: string) {
    this.branchName = branchName;
    const { all, byId, where, meta } = selectorsFactory<ItemT, BranchStateT>(
      branchName
    );
    this.all = all;
    this.byId = byId;
    this.where = where;
    this.meta = meta;
  }
}

/**
 * Action Creators
 */

/** An action creator to reset all branches */
export const resetAllBranches = (): AnyAction => ({
  type: RESET_ALL
});

export const actionsFactory = <
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
>(
  branchName: string,
  defaultItem: Partial<ItemT> = {},
  generateIdFunc: () => string = generateId
) => {
  const constant = constantsFactory(branchName);
  return {
    /** Create an item */
    create: (items?: ItemsT<ItemT>, devToolsSuffix?: string) => {
      const ensureItem = (items || {}) as ItemT;
      const newCreateItems = ensureArray<ItemT>(ensureItem).map(
        (item: ItemT) => {
          if (item.id === undefined) {
            item.id = generateIdFunc();
          }
          return {
            ...defaultItem,
            ...item
          };
        }
      );

      return {
        type: makeType(constant.CREATE, devToolsSuffix),
        items: ensureArray<ItemT>(newCreateItems)
      };
    },
    /** Update an item */
    update: (items: ItemsT<ItemT>, devToolsSuffix?: string) => {
      return {
        type: makeType(constant.UPDATE, devToolsSuffix),
        items: ensureArray<ItemT>(items)
      };
    },
    /** Remove an item */
    remove: (
      items: ItemsT<ItemT> | string | string[],
      devToolsSuffix?: string
    ) => {
      const wrappedItems = !Array.isArray(items) ? [items] : items;

      return {
        type: makeType(constant.REMOVE, devToolsSuffix),
        items: ensureArray<ItemT>(
          typeof wrappedItems[0] === 'string'
            ? (wrappedItems as string[]).map((id: string) => ({ id }))
            : wrappedItems
        )
      };
    },
    /** Replace an item */
    replace: (items: ItemsT<ItemT>, devToolsSuffix?: string) => {
      return {
        type: makeType(constant.REPLACE, devToolsSuffix),
        items: ensureArray<ItemT>(items)
      };
    },
    /** Set meta content */
    setMeta: (meta: Partial<BranchStateT>, devToolsSuffix?: string) => {
      return {
        type: makeType(constant.SET_META, devToolsSuffix),
        meta
      };
    },
    /** Reset branch to initial state */
    reset: (devToolsSuffix?: string) => ({
      type: makeType(constant.RESET, devToolsSuffix)
    })
  };
};

export class Actions<
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
> {
  protected branchName: string;
  protected constant: Constants;
  protected defaultItem: Partial<ItemT>;
  protected generateId: () => string;

  // Really annoying, had to recast the entire interface because you cant
  // extract the return type of generics

  /** Create an item */
  create: (
    items?: Partial<ItemT> | Partial<ItemT>[] | undefined,
    devToolsSuffix?: string | undefined
  ) => {
    type: string;
    items: PartialWithId<ItemT>[];
  };
  /** Update an item */
  update: (
    items: ItemsT<ItemT>,
    devToolsSuffix?: string | undefined
  ) => {
    type: string;
    items: PartialWithId<ItemT>[];
  };
  /** Remove an item */
  remove: (
    items: string | Partial<ItemT> | Partial<ItemT>[] | string[],
    devToolsSuffix?: string | undefined
  ) => {
    type: string;
    items: PartialWithId<ItemT>[];
  };
  /** DEPRECATED, Use remove instead */
  delete: (
    items: string | Partial<ItemT> | Partial<ItemT>[] | string[],
    devToolsSuffix?: string | undefined
  ) => {
    type: string;
    items: PartialWithId<ItemT>[];
  };
  /** Replace an item */
  replace: (
    items: ItemsT<ItemT>,
    devToolsSuffix?: string | undefined
  ) => {
    type: string;
    items: PartialWithId<ItemT>[];
  };
  /** Set meta content */
  setMeta: (
    meta: Partial<BranchStateT>,
    devToolsSuffix?: string | undefined
  ) => {
    type: string;
    meta: Partial<BranchStateT>;
  };
  /** Reset branch to initial state */
  reset: (
    devToolsSuffix?: string | undefined
  ) => {
    type: string;
  };

  constructor(
    branchName: string,
    constants: Constants,
    defaultItem: Partial<ItemT>,
    generateId: () => string
  ) {
    this.branchName = name;
    this.constant = constants;
    this.defaultItem = defaultItem;
    this.generateId = generateId;

    const { create, update, remove, replace, setMeta, reset } = actionsFactory<
      ItemT,
      BranchStateT
    >(branchName, defaultItem, generateId);

    this.create = create;
    this.update = update;
    this.delete = (
      items: ItemsT<ItemT> | string | string[],
      devToolsSuffix?: string
    ) => {
      console.log(
        `${branchName}.action.delete is deprecated. Please use .remove instead.`
      );
      return remove(items, devToolsSuffix);
    };
    this.remove = remove;
    this.replace = replace;
    this.setMeta = setMeta;
    this.reset = reset;
  }
}
type ActionsMap = { [key: string]: (...args: any) => AnyAction };
type SelectorsMap = { [key: string]: (...args: any) => any };

export class StateBranch<
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT>,
  ActionsT extends Actions<ItemT, BranchStateT> | ActionsMap,
  SelectorsT extends Selectors<ItemT, BranchStateT> | SelectorsMap,
  ConstantsT extends { [key: string]: string },
  UtilsT extends { [key: string]: any }
> {
  name: string;
  constant: ConstantsT & Constants;
  util: UtilsT;
  action: ActionsT;
  select: SelectorsT;
  defaultItem: Partial<ItemT>;
  defaultState: BranchStateT;
  protected extendedReducer;

  constructor({
    name,
    // @ts-ignore
    actions: ActionsConstructor = Actions,
    // @ts-ignore
    selectors: SelectorsConstructor = Selectors,
    // @ts-ignore
    constants = {},
    // @ts-ignore
    utils = {},
    // @ts-ignore
    defaultItem = {},
    defaultState = { items: {} } as BranchStateT,
    reducer = (state, action) => state,
    generateId: customGenerateIdFunc = generateId
  }: {
    name: string;
    actions?: ActionsT | (new (...args: any) => ActionsT);
    selectors?: SelectorsT | (new (name: string) => SelectorsT);
    constants?: ConstantsT;
    utils?: UtilsT;
    defaultItem?: Partial<ItemT>;
    defaultState?: BranchStateT;
    reducer?: (state: BranchStateT, action: any) => BranchStateT;
    generateId?: () => string;
  }) {
    this.name = name;

    const defaultConstants = constantsFactory(name);

    this.constant = {
      ...constants,
      ...defaultConstants
    };

    this.util = utils;
    this.defaultItem = defaultItem;
    this.reducer = this.reducer.bind(this);
    this.defaultState = defaultState;
    this.extendedReducer = reducer;
    this.action =
      typeof ActionsConstructor === 'function'
        ? new ActionsConstructor(
            this.name,
            this.constant,
            this.defaultItem,
            customGenerateIdFunc
          )
        : ActionsConstructor;
    this.select =
      typeof SelectorsConstructor === 'function'
        ? new SelectorsConstructor(this.name)
        : SelectorsConstructor;
  }

  reducer(
    state: BranchStateT = this.defaultState,
    _action: AnyAction
  ): BranchStateT {
    const action = _action as StateBranchAction<ItemT, BranchStateT>;
    const items = ensureArray<ItemT>(action.items);
    const type = action.type.split('/', 2).join('/');

    switch (type) {
      case this.constant.CREATE:
        const newCreateItems = items.reduce((acc, item: ItemT) => {
          acc[item.id] = {
            ...(state.items[item.id] || {}),
            ...item
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
        const newUpdateItems = items.reduce((acc, item: ItemT) => {
          acc[item.id] = {
            ...(state.items[item.id] || {}),
            ...item
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
        const newReplaceItems = items.reduce((acc, item: ItemT) => {
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
      case this.constant.REMOVE:
        const newRemoveItems = items.reduce(
          (acc, item: ItemT) => {
            delete acc[item.id];
            return acc;
          },
          { ...state.items }
        );

        return {
          ...state,
          items: newRemoveItems
        };
      case this.constant.SET_META:
        return {
          ...state,
          ...action.meta
        };
      case this.constant.RESET:
      case RESET_ALL:
        return this.defaultState;
      default:
        return this.extendedReducer(state, action);
    }
  }
}
