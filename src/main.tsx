import React from 'react';
import ReactDOM from "react-dom/client";
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async'; // <<--- ИМПОРТ
import App from "./App";
import store from './store';
import "./i18n";
import "./style/globals/global.scss";
import { config as appConfig } from './config/appConfig';

const GOOGLE_CLIENT_ID = appConfig.googleClientIdWeb;

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        {/* HelmetProvider оборачивает все приложение */}
        <HelmetProvider>
            <Provider store={store}>
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <App />
                </GoogleOAuthProvider>
            </Provider>
        </HelmetProvider>
    </React.StrictMode>
);