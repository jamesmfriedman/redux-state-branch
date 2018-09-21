// @flow
declare module 'redux-state-branch' {
  declare type ItemT<T> = T & {
    id: string
  };
  declare type ItemsT<T> = T | T[];
  declare type ItemsShapeT<T> = $Shape<T> | $Shape<T>[];
  declare export type ConstantsT<C> = {
    CREATE: string,
    REPLACE: string,
    UPDATE: string,
    DELETE: string,
    RESET: string,
    SET_META: string
  } & C;

  declare export interface IAction<T> {
    type: string;
    items: ItemsT<T>;
    meta: {
      [key: string]: any
    };
  }
  declare export interface IState {
    [key: string]: any;
  }
  declare export class Selectors<T, BranchT> {
    name: string;
    constructor(name: string): this;
    byId<StateT>(state: StateT, id?: string): T | void;
    all<StateT>(state: StateT): T[];
    where<StateT>(state: StateT, condition: (item: ItemT<T>) => boolean): T[];
    meta<StateT>(state: StateT): BranchT;
  }
  declare export class Actions<T> {
    constant: ConstantsT<any>;
    constructor(constants: ConstantsT<any>): this;
    replace(
      items: ItemsShapeT<T>,
      suffix?: string
    ): {
      type: string,
      items: ItemsShapeT<T>
    };
    delete(
      items: ItemsShapeT<T> | string | string[],
      suffix?: string
    ): {
      type: string,
      items:
        | (string | T)[]
        | {
            id: string
          }[]
    };
    create(
      items?: ItemsShapeT<T>,
      suffix?: string
    ): {
      type: string,
      items: ItemsShapeT<T>
    };
    update(
      items: ItemsShapeT<T>,
      suffix?: string
    ): {
      type: string,
      items: ItemsShapeT<T>
    };
    setMeta(
      meta: {
        [key: string]: any
      },
      suffix?: string
    ): {
      type: string,
      meta: {
        [key: string]: any
      }
    };
    reset(
      suffix?: string
    ): {
      type: string
    };
  }
  declare interface IStateBranchOpts<T, A, S, C, U, B> {
    name: string;
    actions?: Class<A>;
    selectors?: Class<S>;
    constants?: C;
    utils?: U;
    defaultItem?: {
      [key: string]: any
    };
    defaultState?: {
      [key: string]: any
    };
    reducer?: (state: IState, action: IAction<T>) => IState;
  }
  declare export class StateBranch<T, A, S, C, U, B> {
    name: string;
    constant: ConstantsT<C>;
    util: U;
    action: A;
    select: S;
    defaultItem: {
      [key: string]: any
    };
    defaultState: {
      [key: string]: any
    };
    extendedReducer: (state: IState, action: IAction<T>) => IState;
    constructor(opts: IStateBranchOpts<T, A, S, C, U, B>): this;
    reducer(state: IState | void, action: IAction<T>): IState;
  }
}
