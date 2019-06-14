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
    /** Get all items */
    all,
    /** Get an item by id */
    byId: <StateT>(state: StateT, id?: string | null): ItemT | undefined => {
      return state[branchName].items[id || ''];
    },
    /** Get items that meet a filter condition */
    where: <StateT>(
      state: StateT,
      condition: (item: ItemT) => boolean
    ): ItemT[] => {
      return all(state).filter(condition);
    },
    /** Get the top level meta content  */
    meta: <StateT>(state: StateT): BranchStateT => {
      return state[branchName];
    }
  };
};

export class Selectors<
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
> {
  private methods: ReturnType<typeof selectorsFactory>;
  protected branchName: string;

  constructor(branchName: string) {
    this.branchName = branchName;
    this.methods = selectorsFactory<ItemT, BranchStateT>(branchName);
  }

  /** Get all items */
  all<StateT>(state: StateT) {
    return this.methods.all(state);
  }
  /** Get an item by id */
  byId<StateT>(state: StateT, id?: string | null) {
    return this.methods.byId<StateT>(state, id);
  }
  /** Get an items that meet a filter condition */
  where<StateT>(state: StateT, condition: (item: ItemT) => boolean) {
    return this.methods.where(state, condition);
  }
  /** Get the top level meta content  */
  meta<StateT>(state: StateT) {
    return this.methods.meta(state);
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
    create: (items?: ItemsT<ItemT>, typeSuffix?: string) => {
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

export class Actions<
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
> {
  protected branchName: string;
  protected constant: Constants;
  protected defaultItem: Partial<ItemT>;
  protected generateId: () => string;
  private methods: ReturnType<typeof actionsFactory>;

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

    this.methods = actionsFactory<ItemT, BranchStateT>(
      branchName,
      defaultItem,
      generateId
    );
  }

  /** Create an item */
  create(items?: ItemsT<ItemT> | undefined, typeSuffix?: string | undefined) {
    return this.methods.create(items, typeSuffix);
  }
  /** Update an item */
  update(items: ItemsT<ItemT>, typeSuffix?: string | undefined) {
    return this.methods.update(items, typeSuffix);
  }

  /** Remove an item */
  remove(
    items: string | ItemsT<ItemT> | string[],
    typeSuffix?: string | undefined
  ) {
    return this.methods.remove(items, typeSuffix);
  }

  /** DEPRECATED, Use remove instead */
  delete(
    items: string | ItemsT<ItemT> | string[],
    typeSuffix?: string | undefined
  ) {
    return this.methods.remove(items, typeSuffix);
  }

  /** Replace an item */
  replace(items: ItemsT<ItemT>, typeSuffix?: string | undefined) {
    return this.methods.replace(items, typeSuffix);
  }

  /** Set meta content */
  setMeta(meta: Partial<BranchStateT>, typeSuffix?: string | undefined) {
    return this.methods.setMeta(meta, typeSuffix);
  }

  /** Reset branch to initial state */
  reset(typeSuffix?: string | undefined) {
    return this.methods.reset(typeSuffix);
  }
}

type ActionsMap = { [key: string]: Function } & ReturnType<
  typeof actionsFactory
>;
type SelectorsMap = { [key: string]: Function } & ReturnType<
  typeof selectorsFactory
>;

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
    actions: ActionsArg = (Actions as unknown) as ActionsT,
    selectors: SelectorsArg = (Selectors as unknown) as SelectorsT,
    constants = {} as ConstantsT,
    utils = {} as UtilsT,
    defaultItem = {},
    defaultState = { items: {} } as BranchStateT,
    reducer = (state, action) => state,
    generateId: customGenerateIdFunc = generateId
  }: {
    name: string;
    actions?: ActionsT | (new (...args: any) => ActionsT);
    selectors?: SelectorsT | (new (...args: any) => SelectorsT);
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
      typeof ActionsArg === 'function'
        ? new ActionsArg(
            this.name,
            this.constant,
            this.defaultItem,
            customGenerateIdFunc
          )
        : ActionsArg;
    this.select =
      typeof SelectorsArg === 'function'
        ? new SelectorsArg(this.name)
        : SelectorsArg;
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
