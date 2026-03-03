// --- File: src/store/index.ts ---
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import authReducer from './slices/authSlice';
import configReducer from './slices/configSlice';
import dialoguesReducer from './slices/dialoguesSlice';
import websocketReducer from './slices/websocketSlice';
import searchReducer from './slices/searchSlice';
import paymentReducer from './slices/paymentSlice';
import { websocketMiddleware } from './middleware/websocketMiddleware';

// Заглушка для серверного рендеринга (SSR), где window не существует
const createNoopStorage = () => {
    return {
        getItem(_key: string) {
            return Promise.resolve(null);
        },
        setItem(_key: string, value: any) {
            return Promise.resolve(value);
        },
        removeItem(_key: string) {
            return Promise.resolve();
        },
    };
};

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['config', 'auth'],
};

const rootReducer = combineReducers({
    auth: authReducer,
    config: configReducer,
    dialogues: dialoguesReducer,
    websocket: websocketReducer,
    search: searchReducer,
    payment: paymentReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(websocketMiddleware as any),
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;

export default store;