'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store, { persistor } from '../store';
import { config } from '../config/appConfig';
import "../i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        // Provider должен быть доступен всегда (даже при SSR), чтобы хуки Redux не падали
        <Provider store={store}>
            {mounted ? (
                // На клиенте используем PersistGate, чтобы дождаться восстановления стейта из localStorage
                <PersistGate loading={null} persistor={persistor}>
                    <GoogleOAuthProvider clientId={config.googleClientIdWeb}>
                        {children}
                    </GoogleOAuthProvider>
                </PersistGate>
            ) : (
                // На сервере рендерим сразу, используя дефолтный (пустой) стейт Redux
                <GoogleOAuthProvider clientId={config.googleClientIdWeb}>
                    {children}
                </GoogleOAuthProvider>
            )}
        </Provider>
    );
}