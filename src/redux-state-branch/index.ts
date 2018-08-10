type ItemT<T> = T & { id: string };

type ItemsT<T> = T | T[];

interface IConstants {
  CREATE: string;
  REPLACE: string;
  UPDATE: string;
  DELETE: string;
  RESET: string;
  SET_META: string;
}

interface IAction<T> {
  type: string;
  items: ItemsT<T>;
  meta: { [key: string]: any };
}

interface IState {
  [key: string]: any;
}

// type DispatchT = (action: object) => any;

const makeType = (prefix: string, suffix?: string) =>
  `${prefix}${suffix ? "/" + suffix : ""}`;

export class Actions<T> {
  protected constants: IConstants;

  constructor(constants: IConstants) {
    this.constants = constants;
  }

  public replace(items: ItemsT<T>, suffix?: string) {
    return {
      type: makeType(this.constants.REPLACE, suffix),
      items
    };
  }

  public delete(items: ItemsT<T> | string | string[], suffix?: string) {
    const wrappedItems = !Array.isArray(items) ? [items] : items;

    return {
      type: makeType(this.constants.DELETE, suffix),
      items:
        typeof wrappedItems[0] === "string"
          ? (wrappedItems as string[]).map((id: string) => ({ id }))
          : wrappedItems
    };
  }

  public create(items?: ItemsT<T>, suffix?: string) {
    return {
      type: makeType(this.constants.CREATE, suffix),
      items: items || {}
    };
  }

  public update(items: ItemsT<T>, suffix?: string) {
    return {
      type: makeType(this.constants.UPDATE, suffix),
      items
    };
  }

  public setMeta(meta: { [key: string]: any }, suffix?: string) {
    return {
      type: makeType(this.constants.SET_META, suffix),
      meta
    };
  }

  public reset(suffix?: string) {
    return {
      type: makeType(this.constants.RESET, suffix)
    };
  }
}

export class Selectors<T> {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  public byId(state: IState, id: string): T | void {
    return state[this.name].items[id];
  }

  public all(state: IState): T[] {
    return Object.values(state[this.name].items);
  }

  public where(state: IState, condition: (item: ItemT<T>) => boolean): T[] {
    return this.all(state).filter(condition);
  }

  public meta(state: IState): { [key: string]: any } | void {
    const { items, ...meta } = state[this.name];
    return meta;
  }
}

interface IStateBranchOpts<T, A, S> {
  name: string;
  actions?: new (constants: IConstants) => A | Actions<T>;
  selectors?: new (name: string) => S | Selectors<T>;
  defaultItem?: { [key: string]: any };
  defaultState?: { [key: string]: any };
}

export class StateBranch<T, A, S> {
  public name: string;

  public constants: IConstants;
  public action: A | Actions<T>;
  public select: S | Selectors<T>;
  public defaultItem: { [key: string]: any };
  public defaultState: { [key: string]: any };

  constructor({
    name,
    actions: ActionsConstructor = Actions,
    selectors: SelectorsConstructor = Selectors,
    defaultItem = {},
    defaultState = { items: {} }
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
  }

  public reducer(state: any = this.defaultState, action: IAction<T>) {
    const items = Array.isArray(action.items) ? action.items : [action.items];
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
        return state;
    }
  }
}
