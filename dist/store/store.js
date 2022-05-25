"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribe = exports.useStore = exports.setState = exports.getState = void 0;
const zustand_1 = __importDefault(require("zustand"));
const middleware_1 = require("zustand/middleware");
const shallow_1 = __importDefault(require("zustand/shallow"));
const controls = {
    backward: false,
    forward: false,
    left: false,
    right: false,
};
const playerIds = [];
const players = {};
const callRequests = [];
const playersCount = 0;
const animationName = { animationName: 'idle' };
const actionNames = ['idle', 'walking', 'praying', 'fist'];
const cursorState = 'grab';
const useStoreImplementation = (0, zustand_1.default)((0, middleware_1.subscribeWithSelector)((set, get) => {
    return {
        controls,
        players,
        playerIds,
        playersCount,
        callRequests,
        animationName,
        cursorState,
        get,
        set,
    };
}));
const useStore = (sel) => useStoreImplementation(sel, shallow_1.default);
exports.useStore = useStore;
Object.assign(useStore, useStoreImplementation);
const { getState, setState, subscribe } = useStoreImplementation;
exports.getState = getState;
exports.setState = setState;
exports.subscribe = subscribe;
