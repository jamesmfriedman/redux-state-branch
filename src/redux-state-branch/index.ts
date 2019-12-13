import {
  combineReducers,
  compose,
  createStore as reduxCreateStore,
  Reducer,
  Middleware,
  StoreEnhancer,
  applyMiddleware
} from 'redux';

/*******************************************************
 * Definitions
 *******************************************************/
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

export interface State<Item> {
  items: { [key: string]: Item };
  [key: string]: any;
}

type PartialWithId<T> = Partial<T> & { id: string };

/*******************************************************
 * Utils
 *******************************************************/
const makeType = (prefix: string, suffix?: string) =>
  `${prefix}${suffix ? '/' + suffix : ''}`;

const ensureArray = <T>(items: any): PartialWithId<T>[] =>
  Array.isArray(items) ? items : [items];

const defaultGenerateId = (): string => {
  return ([1e7].toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c: any) =>
      (
        c ^
        (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
  );
};

/*******************************************************
 * Constants
 *******************************************************/
const RESET_ALL = 'RESET_ALL_BRANCHES';

export const createConstant = (name: string, constant: string) =>
  `${name}/${constant}`;

export const createConstants = (name: string) => ({
  CREATE: createConstant(name, 'CREATE'),
  REPLACE: createConstant(name, 'REPLACE'),
  UPDATE: createConstant(name, 'UPDATE'),
  REMOVE: createConstant(name, 'REMOVE'),
  SET_META: createConstant(name, 'SET_META'),
  RESET: createConstant(name, 'RESET'),
  NOOP: createConstant(name, 'NOOP')
});

/*******************************************************
 * Selectors
 *******************************************************/

export interface CreateSelectorsOpts {
  /** The name of your branch */
  name: string;
}

/** A factory method for creating selector primitives. */
export const createSelectors = <
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
>({
  name
}: CreateSelectorsOpts) => {
  const all = (
    /** Your store's state object. */
    state: any
  ): ItemT[] => {
    return Object.values(state[name].items);
  };

  return {
    /** Get all items */
    all,
    /** Get an item by id */
    byId: (
      /** Your store's state object. */
      state: any,
      {
        id
      }: {
        /** The ID of your item */
        id?: string | null;
      }
    ): ItemT | undefined => {
      return state[name].items[id || ''];
    },
    /** Gets an object map of unique ids to items {itemId: ItemT} */
    mapById: (
      /** Your store's state object. */
      state: any
    ) => state[name].items as { [key: string]: ItemT },
    /** Gets an object map of values of an item to an item {itemValueForKey: ItemT[]} */
    mapByKey: (
      /** Your store's state object. */
      state: any,
      {
        key
      }: {
        /** The key would would like to map the object by */
        key: string;
      }
    ) => {
      const items = state[name].items as { [key: string]: ItemT };

      return Object.values(items).reduce<{ [key: string]: ItemT[] }>(
        (acc, item) => {
          acc[item[key]] = acc[item[key]] || [];
          acc[item[key]].push(item);
          return acc;
        },
        {}
      );
    },
    /** Get items that meet a filter condition */
    where: (
      /** Your store's state object. */
      state: any,
      {
        callback
      }: {
        /** A callback to pass the filter function */
        callback: (item: ItemT, index: number) => boolean;
      }
    ): ItemT[] => {
      return all(state).filter(callback);
    },
    /** Get the top level meta content  */
    meta: (
      /** Your store's state object. */
      state: any
    ): BranchStateT => {
      return state[name];
    }
  };
};

/*******************************************************
 * Action Creators
 *******************************************************/

/** An action creator to reset all branches */
export const resetAllBranches = (): AnyAction => ({
  type: RESET_ALL
});

/** A factory method for creating action primitives. */
export interface CreateActionsOpts<ItemT> {
  /** The name of your branch  */
  name: string;
  /** A default item used when creating new items  */
  defaultItem?: Partial<ItemT>;
  /** A default item used when creating new items  */
  generateId?: () => string;
}

/** A factory method for creating action primitives. */
export const createActions = <
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
>({
  name,
  defaultItem = {},
  generateId = defaultGenerateId
}: CreateActionsOpts<ItemT>) => {
  const constant = createConstants(name);
  return {
    /** Create an item */
    create: (items?: ItemsT<ItemT>, typeSuffix?: string) => {
      const ensureItem = (items || {}) as ItemT;
      const newCreateItems = ensureArray<ItemT>(ensureItem).map(item => {
        if (item.id === undefined) {
          item.id = generateId();
        }
        return {
          ...defaultItem,
          ...item
        };
      });

      return {
        type: makeType(constant.CREATE, typeSuffix),
        items: ensureArray<ItemT>(newCreateItems)
      };
    },
    /** Update an item */
    update: (items: ItemsT<ItemT>, typeSuffix?: string) => {
      return {
        type: makeType(constant.UPDATE, typeSuffix),
        items: ensureArray<ItemT>(items)
      };
    },
    /** Remove an item */
    remove: (items: ItemsT<ItemT> | string | string[], typeSuffix?: string) => {
      const wrappedItems = !Array.isArray(items) ? [items] : items;

      return {
        type: makeType(constant.REMOVE, typeSuffix),
        items: ensureArray<ItemT>(
          typeof wrappedItems[0] === 'string'
            ? (wrappedItems as string[]).map((id: string) => ({ id }))
            : wrappedItems
        )
      };
    },
    /** Replace an item */
    replace: (items: ItemsT<ItemT>, typeSuffix?: string) => {
      return {
        type: makeType(constant.REPLACE, typeSuffix),
        items: ensureArray<ItemT>(items)
      };
    },
    /** Set meta content */
    setMeta: (meta: Partial<BranchStateT>, typeSuffix?: string) => {
      return {
        type: makeType(constant.SET_META, typeSuffix),
        meta
      };
    },
    /** Reset branch to initial state */
    reset: (typeSuffix?: string) => ({
      type: makeType(constant.RESET, typeSuffix)
    }),
    /** Do nothing */
    noop: (typeSuffix?: string) => ({
      type: makeType(constant.NOOP, typeSuffix)
    })
  };
};

/*******************************************************
 * State Branch
 *******************************************************/

export interface StateBranchOpts<
  ActionsT,
  SelectorsT,
  ConstantsT,
  UtilsT,
  ItemT,
  BranchStateT
> {
  /** The name of your branch. */
  name: string;
  /** Additional actions to use with your branch. */
  actions?: ActionsT;
  /** Additional selectors to use with your branch. */
  selectors?: SelectorsT;
  /** Additional constants to use with your branch. */
  constants?: ConstantsT;
  /** Additional utilities to use with your branch. */
  utils?: UtilsT;
  /** A defaultItem to be merged into newly created objects. This only applies if you have NOT specified any custom actions. When specifying custom actions, pass the defaultItem to the `createActions` factory. */
  defaultItem?: Partial<ItemT>;
  /** An initial state for the reducer. */
  defaultState?: BranchStateT;
  /** Custom reducer handling to be used in addition to Redux StateBranch's built in handling. */
  reducer?: Reducer<BranchStateT>;
  /** A custom id generating function for newly created objects. This only applies if you have NOT specified any custom actions. When specifying custom actions, pass the generateId function to the `createActions` factory. */
  generateId?: () => string;
}

/** A factory for creating branches of your state. */
export const stateBranch = <
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT>
>() => <
  ActionsT,
  SelectorsT,
  ConstantsT,
  UtilsT,
  RestT extends { [key: string]: any }
>({
  name,
  defaultItem = {},
  generateId: customGenerateIdFunc = defaultGenerateId,
  actions: customActions = {} as ActionsT,
  selectors: customSelectors = {} as SelectorsT,
  constants: customConstants = {} as ConstantsT,
  utils = {} as UtilsT,
  defaultState = { items: {} } as BranchStateT,
  reducer: extendedReducer = (state, action) => state as BranchStateT,
  ...rest
}: StateBranchOpts<
  ActionsT,
  SelectorsT,
  ConstantsT,
  UtilsT,
  ItemT,
  BranchStateT
> &
  RestT) => {
  const constant = {
    ...customConstants,
    ...createConstants(name)
  };

  const defaultActions = createActions<ItemT, BranchStateT>({
    name,
    defaultItem,
    generateId: customGenerateIdFunc
  });

  const defaultSelectors = createSelectors<ItemT, BranchStateT>({
    name
  });

  const reducer = (_state: any = defaultState, _action: any): BranchStateT => {
    const state = _state as BranchStateT;
    const action = _action as StateBranchAction<ItemT, BranchStateT>;
    const items = ensureArray<ItemT>(action.items);
    const type = action.type.split('/', 2).join('/');

    switch (type) {
      case constant.CREATE:
        const newCreateItems = items.reduce<{ [id: string]: ItemT }>(
          (acc, item) => {
            acc[item.id] = {
              ...(state.items[item.id] || {}),
              ...item
            };
            return acc;
          },
          {}
        );

        return {
          ...state,
          items: {
            ...state.items,
            ...newCreateItems
          }
        };
      case constant.UPDATE:
        const newUpdateItems = items.reduce<{ [id: string]: ItemT }>(
          (acc, item) => {
            acc[item.id] = {
              ...(state.items[item.id] || {}),
              ...item
            };
            return acc;
          },
          {}
        );

        return {
          ...state,
          items: {
            ...state.items,
            ...newUpdateItems
          }
        };
      case constant.REPLACE:
        const newReplaceItems = items.reduce<{ [id: string]: ItemT }>(
          (acc, item) => {
            acc[item.id] = item as ItemT;
            return acc;
          },
          {}
        );

        return {
          ...state,
          items: {
            ...state.items,
            ...newReplaceItems
          }
        };
      case constant.REMOVE:
        const newRemoveItems = items.reduce(
          (acc, item) => {
            delete acc[item.id];
            return acc;
          },
          { ...state.items }
        );

        return {
          ...state,
          items: newRemoveItems
        };
      case constant.SET_META:
        return {
          ...state,
          ...action.meta
        };
      case constant.RESET:
      case RESET_ALL:
        return defaultState;
      default:
        return extendedReducer(state, action);
    }
  };

  return {
    ...rest,
    name,
    constant,
    util: utils,
    defaultItem,
    reducer,
    defaultState,
    action: {
      ...defaultActions,
      ...customActions
    },
    select: {
      ...defaultSelectors,
      ...customSelectors
    }
  };
};

/*******************************************************
 * Create Store
 *******************************************************/

export interface CreateStoreOpts {
  /** An array of enhancers to pass to the store. */
  enhancers?: StoreEnhancer[];
  /** An array of middleware to pass to the store. */
  middleware?: Middleware[];
  /** An object map of reducers */
  reducers?: { [reducerName: string]: Reducer };
  /** Whether or not to enable devTools */
  devTools?: boolean;
}

/** A factory for creating a Redux store. */
export const createStore = ({
  reducers = {},
  middleware = [],
  enhancers = [],
  devTools = false
}: CreateStoreOpts) => {
  // Easiest way to get devtools working in your browser if you have the extension installed
  const composeEnhancers =
    (devTools && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

  const rootReducer = combineReducers(reducers);

  const enhancer = composeEnhancers(
    applyMiddleware(...middleware),
    ...enhancers
  );

  return reduxCreateStore(rootReducer, enhancer);
};
