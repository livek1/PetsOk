// --- File: src/main.tsx ---
import React from 'react';
import ReactDOM from "react-dom/client";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Импорт
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import App from "./App";
import store, { persistor } from './store'; // Импорт persistor
import "./i18n";
import "./style/globals/global.scss";
import { config as appConfig } from './config/appConfig';

const GOOGLE_CLIENT_ID = appConfig.googleClientIdWeb;

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <HelmetProvider>
            <Provider store={store}>
                {/* loading={null} означает, что пока данные грузятся из localStorage (это мгновенно), ничего не показываем. Можно поставить спиннер */}
                <PersistGate loading={null} persistor={persistor}>
                    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                        <App />
                    </GoogleOAuthProvider>
                </PersistGate>
            </Provider>
        </HelmetProvider>
    </React.StrictMode>
);