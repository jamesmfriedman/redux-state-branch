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
  DELETE: string;
  RESET: string;
  SET_META: string;
}

export interface State<Item> {
  items: { [key: string]: Item };
  [key: string]: any;
}

/**
 * Constants
 */
const RESET_ALL = 'RESET_ALL_BRANCHES';

/**
 * Utils
 */
const makeType = (prefix: string, suffix?: string) =>
  `${prefix}${suffix ? '/' + suffix : ''}`;

const ensureArray = <T>(items: T): T[] =>
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

/**
 * Action Creators
 */

/** An action creator to reset all branches */
export const resetAllBranches = (): AnyAction => ({
  type: RESET_ALL
});

/**
 * Selectors
 */
export class Selectors<
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
> {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  byId<StateT>(state: StateT, id?: string | null): ItemT | undefined {
    return state[this.name].items[id || ''];
  }

  all<StateT>(state: StateT): ItemT[] {
    return Object.values(state[this.name].items);
  }

  where<StateT>(state: StateT, condition: (item: ItemT) => boolean): ItemT[] {
    return this.all(state).filter(condition);
  }

  meta<StateT>(state: StateT): BranchStateT {
    return state[this.name];
  }
}

export class Actions<
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>
> {
  protected constant: Constants;
  protected defaultItem: Partial<ItemT>;
  protected generateId: () => string;

  constructor(
    constants: Constants,
    defaultItem: Partial<ItemT>,
    generateId: () => string
  ) {
    this.constant = constants;
    this.defaultItem = defaultItem;
    this.generateId = generateId;
  }

  replace(items: ItemsT<ItemT>, devToolsSuffix?: string) {
    return {
      type: makeType(this.constant.REPLACE, devToolsSuffix),
      items: ensureArray(items)
    };
  }

  delete(items: ItemsT<ItemT> | string | string[], devToolsSuffix?: string) {
    const wrappedItems = !Array.isArray(items) ? [items] : items;

    return {
      type: makeType(this.constant.DELETE, devToolsSuffix),
      items: ensureArray(
        typeof wrappedItems[0] === 'string'
          ? (wrappedItems as string[]).map((id: string) => ({ id }))
          : wrappedItems
      )
    };
  }

  create(items?: ItemsT<ItemT>, devToolsSuffix?: string) {
    const ensureItem = (items || {}) as ItemT;
    const newCreateItems = ensureArray<ItemT>(ensureItem).map((item: ItemT) => {
      if (item.id === undefined) {
        item.id = this.generateId();
      }

      return {
        ...this.defaultItem,
        ...item
      };
    });

    return {
      type: makeType(this.constant.CREATE, devToolsSuffix),
      items: newCreateItems
    };
  }

  update(items: ItemsT<ItemT>, devToolsSuffix?: string) {
    return {
      type: makeType(this.constant.UPDATE, devToolsSuffix),
      items: ensureArray(items)
    };
  }

  setMeta(meta: Partial<BranchStateT>, devToolsSuffix?: string) {
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

export class StateBranch<
  ItemT extends AnyItem,
  BranchStateT extends State<ItemT> = State<ItemT>,
  ActionsT extends Actions<ItemT, BranchStateT> = Actions<ItemT, BranchStateT>,
  SelectorsT extends Selectors<ItemT, BranchStateT> = Selectors<
    ItemT,
    BranchStateT
  >,
  ConstantsT extends { [key: string]: string } = { [key: string]: string },
  UtilsT extends { [key: string]: any } = { [key: string]: any }
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
    actions?: new (
      constants: Constants,
      defaultItem: Partial<ItemT>,
      generateId: () => string
    ) => ActionsT;
    selectors?: new (name: string) => SelectorsT;
    constants?: ConstantsT;
    utils?: UtilsT;
    defaultItem?: Partial<ItemT>;
    defaultState?: BranchStateT;
    reducer?: (state: BranchStateT, action: any) => BranchStateT;
    generateId?: () => string;
  }) {
    this.name = name;

    const defaultConstants: Constants = {
      CREATE: `${name}/CREATE`,
      REPLACE: `${name}/REPLACE`,
      UPDATE: `${name}/UPDATE`,
      DELETE: `${name}/DELETE`,
      SET_META: `${name}/SET_META`,
      RESET: `${name}/RESET`
    };

    this.constant = {
      ...constants,
      ...defaultConstants
    };

    this.util = utils;
    this.defaultItem = defaultItem;
    this.reducer = this.reducer.bind(this);
    this.defaultState = defaultState;
    this.extendedReducer = reducer;
    this.action = new ActionsConstructor(
      this.constant,
      this.defaultItem,
      customGenerateIdFunc
    );
    this.select = new SelectorsConstructor(this.name);
  }

  reducer(
    state: BranchStateT = this.defaultState,
    _action: AnyAction
  ): BranchStateT {
    const action = _action as StateBranchAction<ItemT, BranchStateT>;
    const items = ensureArray(action.items);
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
      case this.constant.DELETE:
        const newDeleteItems = items.reduce(
          (acc, item: ItemT) => {
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
      case RESET_ALL:
        return this.defaultState;
      default:
        return this.extendedReducer(state, action);
    }
  }
}
