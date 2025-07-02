// --- File: src/pages/AppRedirectPage.tsx ---
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import { config } from '../config/appConfig';
import style from '../style/pages/AppRedirectPage.module.scss'; // Стили для этой страницы

// Утилита для определения ОС
const getMobileOperatingSystem = (): 'iOS' | 'Android' | 'unknown' => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        return "iOS";
    }

    return "unknown";
};


const AppRedirectPage: React.FC = () => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<'redirecting' | 'fallback'>('redirecting');

    useEffect(() => {
        const os = getMobileOperatingSystem();

        if (os === 'iOS') {
            window.location.href = config.appStoreUrl;
        } else if (os === 'Android') {
            window.location.href = config.googlePlayUrl;
        } else {
            // Если это десктоп или неизвестная ОС, показываем страницу-заглушку
            setStatus('fallback');
        }
    }, []);

    if (status === 'redirecting') {
        return (
            <div className={style.redirectContainer}>
                <div className={style.loader}></div>
                <p>{t('appRedirect.redirecting', 'Перенаправляем в магазин приложений...')}</p>
            </div>
        );
    }

    // Fallback для десктопов
    return (
        <>
            <Helmet>
                <title>{t('appRedirect.pageTitle', 'Загрузите приложение PetsOk')}</title>
            </Helmet>
            <div className={style.fallbackContainer}>
                <div className={style.fallbackContent}>
                    <div className={style.logo}>📱</div>
                    <h1>{t('appRedirect.title', 'Загрузите наше приложение')}</h1>
                    <p>{t('appRedirect.subtitle', 'Для лучшего опыта используйте мобильное приложение PetsOk. Отсканируйте QR-код или выберите ваш магазин.')}</p>

                    <div className={style.qrCodeWrapper}>
                        <QRCodeCanvas
                            value={config.appUniversalUrl} // Ссылка на эту же страницу
                            size={160}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>

                    <div className={style.storeButtons}>
                        <a href={config.appStoreUrl} className={`${style.storeButton} ${style.apple}`} target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor"><path d="M16.511 11.45a5.204 5.204 0 00-3.32-4.432 5.342 5.342 0 00-4.321.465c-.9.6-1.74 1.83-2.2 3.016-1.739 4.381.583 8.79 2.373 11.605.86.1.413 1.748 2.373 1.748 1.54 0 2.219-.997 3.73-.997s1.49.997 3.078.95c1.64-.047 2.68-1.54 3.518-2.916.9-1.588 1.25-3.266 1.299-3.363a.52.52 0 00-.472-.73c-2.115-.28-3.385-1.587-3.41-3.363zm-2.42-4.997a4.91 4.91 0 011.66-3.116c-.058 0-1.719 1.094-3.167 2.373-1.282 1.14-2.228 2.73-1.928 4.431.149 0 1.858-1.14 3.435-3.688z"></path></svg>
                            <span>App Store</span>
                        </a>
                        <a href={config.googlePlayUrl} className={`${style.storeButton} ${style.google}`} target="_blank" rel="noopener noreferrer">
                            <svg width="22" height="24" viewBox="0 0 22 24" fill="currentColor"><path d="M21.47 12.337l-9.752-5.717a.64.64 0 00-.95.556v11.43a.639.639 0 00.95.556l9.752-5.716a.64.64 0 000-1.112zM4.14 23.361a.63.63 0 01-.63-.63V1.272a.63.63 0 01.63-.63.63.63 0 01.63.63v21.458a.63.63 0 01-.63.631zM6.66 21.459a.63.63 0 01-.63-.63V3.172a.63.63 0 111.26 0v17.657a.63.63 0 01-.63.63z"></path></svg>
                            <span>Google Play</span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

// Стили для страницы редиректа. Создайте файл `src/pages/AppRedirectPage.module.scss`
// и вставьте этот код туда.
/* --- File: src/pages/AppRedirectPage.module.scss ---
@use '../style/variables' as *;

.redirectContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f7fafc;
    font-family: $font-family-base;
    gap: 20px;

    p {
        font-size: $font-size-lg;
        color: $text-color-secondary;
    }
}

.loader {
    width: 50px;
    height: 50px;
    border: 5px solid $border-color-light;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.fallbackContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f0f4f8;
    padding: 40px 20px;
    text-align: center;
    font-family: $font-family-base;
}

.fallbackContent {
    background: #fff;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    max-width: 500px;

    .logo {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    h1 {
        font-size: 28px;
        font-weight: $font-weight-bold;
        color: $text-color-base;
        margin-bottom: 1rem;
    }

    p {
        color: $text-color-secondary;
        margin-bottom: 2rem;
        line-height: 1.6;
    }
}

.qrCodeWrapper {
    margin-bottom: 2rem;
    padding: 10px;
    background: #fff;
    border-radius: 8px;
    display: inline-block;
}

.storeButtons {
    display: flex;
    justify-content: center;
    gap: 15px;

    @media (max-width: $breakpoint-sm) {
        flex-direction: column;
        align-items: stretch;
    }
}

.storeButton {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 22px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.2s;
    justify-content: center;

    &.apple {
        background-color: #000;
        color: #fff;
    }

    &.google {
        background-color: #fff;
        color: #333;
        border: 1px solid #ccc;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
}
*/
export default AppRedirectPage;