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

const constants = (name: string): Constants => ({
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

export const selectors = <
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
>({
  name
}: {
  /* The name of  your branch */
  name: string;
}) => {
  const all = <StateT>({
    state
  }: {
    /** A global state object */
    state: StateT;
  }): ItemT[] => {
    return Object.values(state[name].items);
  };

  return {
    /** Get all items */
    all,
    /** Get an item by id */
    byId: <StateT>({
      state,
      id
    }: {
      /** A global state object */
      state: StateT;
      /** The ID of your item */
      id?: string | null;
    }): ItemT | undefined => {
      return state[name].items[id || ''];
    },
    /** Get items that meet a filter condition */
    where: <StateT>({
      state,
      callback
    }: {
      /** A global state object */
      state: StateT;
      /** A callback to pass the filter function */
      callback: (item: ItemT, index: number) => boolean;
    }): ItemT[] => {
      return all({ state }).filter(callback);
    },
    /** Get the top level meta content  */
    meta: <StateT>({
      state
    }: {
      /** A global state object */
      state: StateT;
    }): BranchStateT => {
      return state[name];
    }
  };
};

/**
 * Action Creators
 */

/** An action creator to reset all branches */
export const resetAllBranches = (): AnyAction => ({
  type: RESET_ALL
});

export const actions = <
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
>({
  name,
  defaultItem = {},
  generateId = defaultGenerateId
}: {
  /* The name of your branch  */
  name: string;
  /* A default item used when creating new items  */
  defaultItem?: Partial<ItemT>;
  /* A default item used when creating new items  */
  generateId?: () => string;
}) => {
  const constant = constants(name);
  return {
    /** Create an item */
    create: (items?: ItemsT<ItemT>, typeSuffix?: string) => {
      const ensureItem = (items || {}) as ItemT;
      const newCreateItems = ensureArray<ItemT>(ensureItem).map(
        (item: ItemT) => {
          if (item.id === undefined) {
            item.id = generateId();
          }
          return {
            ...defaultItem,
            ...item
          };
        }
      );

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
    })
  };
};

export const stateBranch = <
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT>
>() => <
  ActionsT,
  SelectorsT,
  ConstantsT extends { [key: string]: string },
  UtilsT extends { [key: string]: any }
>({
  name,
  defaultItem = {},
  generateId: customGenerateIdFunc = defaultGenerateId,
  actions: customActions = {} as ActionsT,
  selectors: customSelectors = {} as SelectorsT,
  constants: customConstants = {} as ConstantsT,
  utils = {} as UtilsT,
  defaultState = { items: {} } as BranchStateT,
  reducer: extendedReducer = (state, action) => state
}: {
  name: string;
  actions?: ActionsT;
  selectors?: SelectorsT;
  constants?: ConstantsT;
  utils?: UtilsT;
  defaultItem?: Partial<ItemT>;
  defaultState?: BranchStateT;
  reducer?: (state: BranchStateT, action: any) => BranchStateT;
  generateId?: () => string;
}) => {
  const constant = {
    ...customConstants,
    ...constants(name)
  };

  const defaultActions = actions<ItemT, BranchStateT>({
    name,
    defaultItem,
    generateId: customGenerateIdFunc
  });

  const defaultSelectors = selectors<ItemT, BranchStateT>({ name });

  const reducer = (
    _state: any = defaultState,
    _action: AnyAction
  ): BranchStateT => {
    const state = _state as BranchStateT;
    const action = _action as StateBranchAction<ItemT, BranchStateT>;
    const items = ensureArray<ItemT>(action.items);
    const type = action.type.split('/', 2).join('/');

    switch (type) {
      case constant.CREATE:
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
      case constant.UPDATE:
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
      case constant.REPLACE:
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
      case constant.REMOVE:
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
