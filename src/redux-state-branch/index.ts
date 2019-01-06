export const makeType = (prefix: string, suffix?: string) =>
  `${prefix}${suffix ? "/" + suffix : ""}`;

export const ensureArray = (items: any) =>
  Array.isArray(items) ? items : [items];

export interface MappedT<T = any> {
  [key: string]: T;
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
  meta: MappedT;
}

export interface IState {
  [key: string]: any;
}

export const generateId = (): string => {
  return ([1e7].toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c: any) =>
      (
        c ^
        (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
  );
};

export class Selectors<ItemType, BranchType> {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  byId<StateT>(state: StateT, id?: ID): ItemType | undefined {
    return state[this.name].items[id || ""];
  }

  all<StateT>(state: StateT): ItemType[] {
    return Object.values(state[this.name].items);
  }

  where<StateT>(
    state: StateT,
    condition: (item: ItemT<ItemType>) => boolean
  ): ItemType[] {
    return this.all(state).filter(condition);
  }

  meta<StateT>(state: StateT): BranchType {
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
        item.id = generateId();
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

  setMeta(meta: MappedT, devToolsSuffix?: string) {
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

interface IStateBranchOpts<
  BranchStateType,
  ItemType,
  ActionsType = Actions<ItemType>,
  SelectorsType = Selectors<ItemType, BranchStateType>,
  ConstantsType = {},
  UtilsType = {}
> {
  name: string;
  actions?: new (
    constants: ConstantsT<ConstantsType>,
    defaultItem: MappedT
  ) => ActionsType;
  selectors?: new (name: string) => SelectorsType;
  constants?: ConstantsType;
  utils?: UtilsType;
  defaultItem?: MappedT;
  defaultState?: MappedT;
  reducer?: (state: IState, action: IAction<ItemType>) => IState;
}

export class StateBranch<
  ItemType,
  BranchStateType,
  ActionsType = Actions<ItemType>,
  SelectorsType = Selectors<ItemType, BranchStateType>,
  ConstantsType = {},
  UtilsType = {}
> {
  name: string;

  constant: ConstantsT<ConstantsType>;
  util: UtilsType;
  action: ActionsType;
  select: SelectorsType;
  defaultItem: MappedT;
  defaultState: MappedT;
  protected extendedReducer: (
    state: IState,
    action: IAction<ItemType>
  ) => IState;

  constructor({
    name,
    // @ts-ignore
    actions: ActionsConstructor = Actions,
    // @ts-ignore
    selectors: SelectorsConstructor = Selectors,
    // @ts-ignore
    constants = {},
    utils,
    defaultItem = {},
    defaultState = { items: {} },
    reducer = (state, action) => state
  }: IStateBranchOpts<
    BranchStateType,
    ItemType,
    ActionsType,
    SelectorsType,
    ConstantsType,
    UtilsType
  >) {
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

  reducer(state: IState = this.defaultState, action: IAction<ItemType>) {
    const items = ensureArray(action.items);
    const type = action.type.split("/", 2).join("/");

    switch (type) {
      case this.constant.CREATE:
        const newCreateItems = items.reduce((acc, item: ItemT<ItemType>) => {
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
            ...newCreateItems
          }
        };
      case this.constant.UPDATE:
        const newUpdateItems = items.reduce((acc, item: ItemT<ItemType>) => {
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
        const newReplaceItems = items.reduce((acc, item: ItemT<ItemType>) => {
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
          (acc, item: ItemT<ItemType>) => {
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
