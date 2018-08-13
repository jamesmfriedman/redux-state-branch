export declare type ItemT<T> = T & {
    id: string;
};
export declare type ItemsT<T> = T | T[];
export interface IConstants {
    CREATE: string;
    REPLACE: string;
    UPDATE: string;
    DELETE: string;
    RESET: string;
    SET_META: string;
}
export interface IAction<T> {
    type: string;
    items: ItemsT<T>;
    meta: {
        [key: string]: any;
    };
}
export interface IState {
    [key: string]: any;
}
export declare class Selectors<T> {
    protected name: string;
    constructor(name: string);
    byId(state: IState, id: string): T | void;
    all(state: IState): T[];
    where(state: IState, condition: (item: ItemT<T>) => boolean): T[];
    meta(state: IState): {
        [key: string]: any;
    } | void;
}
export declare class Actions<T> {
    protected constants: IConstants;
    constructor(constants: IConstants);
    replace(items: ItemsT<T>, suffix?: string): {
        type: string;
        items: ItemsT<T>;
    };
    delete(items: ItemsT<T> | string | string[], suffix?: string): {
        type: string;
        items: (string | T)[] | {
            id: string;
        }[];
    };
    create(items?: ItemsT<T>, suffix?: string): {
        type: string;
        items: {};
    };
    update(items: ItemsT<T>, suffix?: string): {
        type: string;
        items: ItemsT<T>;
    };
    setMeta(meta: {
        [key: string]: any;
    }, suffix?: string): {
        type: string;
        meta: {
            [key: string]: any;
        };
    };
    reset(suffix?: string): {
        type: string;
    };
}
interface IStateBranchOpts<T, A, S> {
    name: string;
    actions?: new (constants: IConstants) => A | Actions<T>;
    selectors?: new (name: string) => S | Selectors<T>;
    defaultItem?: {
        [key: string]: any;
    };
    defaultState?: {
        [key: string]: any;
    };
    reducer?: (state: IState, action: IAction<T>) => IState;
}
export declare class StateBranch<T, A, S> {
    name: string;
    constants: IConstants;
    action: A | Actions<T>;
    select: S | Selectors<T>;
    defaultItem: {
        [key: string]: any;
    };
    defaultState: {
        [key: string]: any;
    };
    protected extendedReducer: (state: IState, action: IAction<T>) => IState;
    constructor({ name, actions: ActionsConstructor, selectors: SelectorsConstructor, defaultItem, defaultState, reducer }: IStateBranchOpts<T, A, S>);
    reducer(state: IState | undefined, action: IAction<T>): IState;
}
export {};
