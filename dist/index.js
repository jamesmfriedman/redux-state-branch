var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
import { makeType } from './utils';
var Selectors = /** @class */ (function () {
    function Selectors(name) {
        this.name = name;
    }
    Selectors.prototype.byId = function (state, id) {
        return state[this.name].items[id];
    };
    Selectors.prototype.all = function (state) {
        return Object.values(state[this.name].items);
    };
    Selectors.prototype.where = function (state, condition) {
        return this.all(state).filter(condition);
    };
    Selectors.prototype.meta = function (state) {
        var _a = state[this.name], items = _a.items, meta = __rest(_a, ["items"]);
        return meta;
    };
    return Selectors;
}());
export { Selectors };
var Actions = /** @class */ (function () {
    function Actions(constants) {
        this.constants = constants;
    }
    Actions.prototype.replace = function (items, suffix) {
        return {
            type: makeType(this.constants.REPLACE, suffix),
            items: items
        };
    };
    Actions.prototype.delete = function (items, suffix) {
        var wrappedItems = !Array.isArray(items) ? [items] : items;
        return {
            type: makeType(this.constants.DELETE, suffix),
            items: typeof wrappedItems[0] === "string"
                ? wrappedItems.map(function (id) { return ({ id: id }); })
                : wrappedItems
        };
    };
    Actions.prototype.create = function (items, suffix) {
        return {
            type: makeType(this.constants.CREATE, suffix),
            items: items || {}
        };
    };
    Actions.prototype.update = function (items, suffix) {
        return {
            type: makeType(this.constants.UPDATE, suffix),
            items: items
        };
    };
    Actions.prototype.setMeta = function (meta, suffix) {
        return {
            type: makeType(this.constants.SET_META, suffix),
            meta: meta
        };
    };
    Actions.prototype.reset = function (suffix) {
        return {
            type: makeType(this.constants.RESET, suffix)
        };
    };
    return Actions;
}());
export { Actions };
var StateBranch = /** @class */ (function () {
    function StateBranch(_a) {
        var name = _a.name, _b = _a.actions, ActionsConstructor = _b === void 0 ? Actions : _b, _c = _a.selectors, SelectorsConstructor = _c === void 0 ? Selectors : _c, _d = _a.defaultItem, defaultItem = _d === void 0 ? {} : _d, _e = _a.defaultState, defaultState = _e === void 0 ? { items: {} } : _e, _f = _a.reducer, reducer = _f === void 0 ? function (state, action) { return state; } : _f;
        this.name = name;
        this.constants = {
            CREATE: name + "/CREATE",
            REPLACE: name + "/REPLACE",
            UPDATE: name + "/UPDATE",
            DELETE: name + "/DELETE",
            SET_META: name + "/SET_META",
            RESET: name + "/RESET"
        };
        this.action = new ActionsConstructor(this.constants);
        this.select = new SelectorsConstructor(this.name);
        this.reducer = this.reducer.bind(this);
        this.defaultItem = defaultItem;
        this.defaultState = defaultState;
        this.extendedReducer = reducer;
    }
    StateBranch.prototype.reducer = function (state, action) {
        var _this = this;
        if (state === void 0) { state = this.defaultState; }
        var items = Array.isArray(action.items) ? action.items : [action.items];
        var type = action.type.split("/", 2).join("/");
        switch (type) {
            case this.constants.CREATE:
                var newCreateItems = items.reduce(function (acc, item) {
                    if (item.id === undefined) {
                        if (action.type === _this.constants.CREATE) {
                            item.id = "-" + Math.random()
                                .toString(16)
                                .slice(2);
                        }
                    }
                    acc[item.id] = __assign({}, _this.defaultItem, item);
                    return acc;
                }, {});
                return __assign({}, state, { items: __assign({}, state.items, newCreateItems) });
            case this.constants.UPDATE:
                var newUpdateItems = items.reduce(function (acc, item) {
                    acc[item.id] = __assign({}, (state.items[item.id] || {}), item);
                    return acc;
                }, {});
                return __assign({}, state, { items: __assign({}, state.items, newUpdateItems) });
            case this.constants.REPLACE:
                var newReplaceItems = items.reduce(function (acc, item) {
                    acc[item.id] = item;
                    return acc;
                }, {});
                return __assign({}, state, { items: __assign({}, state.items, newReplaceItems) });
            case this.constants.DELETE:
                var newDeleteItems = items.reduce(function (acc, item) {
                    delete acc[item.id];
                    return acc;
                }, __assign({}, state.items));
                return __assign({}, state, { items: newDeleteItems });
            case this.constants.SET_META:
                return __assign({}, state, action.meta);
            case this.constants.RESET:
                return this.defaultState;
            default:
                return this.extendedReducer(state, action);
        }
    };
    return StateBranch;
}());
export { StateBranch };
//# sourceMappingURL=index.js.map