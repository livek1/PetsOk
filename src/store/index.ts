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
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import configReducer from './slices/configSlice';
import dialoguesReducer from './slices/dialoguesSlice';
import websocketReducer from './slices/websocketSlice';
import searchReducer from './slices/searchSlice';
import paymentReducer from './slices/paymentSlice';
import { websocketMiddleware } from './middleware/websocketMiddleware';

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

// 1. Сначала создаем store БЕЗ middleware, который зависит от RootState
//    Или просто определяем RootState на основе rootReducer
export type RootState = ReturnType<typeof rootReducer>;

// 2. Теперь создаем store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(websocketMiddleware as any), // as any спасет от ошибки типизации middleware
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;

export default store;