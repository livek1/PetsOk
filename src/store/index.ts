import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'; // Мы создадим это дальше

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // ...другие ваши слайсы, если будут
    },
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger), // Пример добавления middleware (например, logger)
});

// Типы для всего состояния приложения и диспетчера
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;