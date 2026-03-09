"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { RootState } from '../../store';
import { config as defaultConfig } from '../../config/appConfig';
import style from '../../style/pages/AppRedirectPage.module.scss';
import Image from 'next/image'; // Предполагаем, что у вас есть картинка телефона

// Функция получения реферального кода
const getReferralCode = (): string | undefined => {
    return Cookies.get(defaultConfig.referralParamName);
};

// Оригинальный логотип Apple (белый, с правильными пропорциями)
const AppleLogo = () => (
    <svg width="38" height="38" viewBox="0 0 384 512" fill="currentColor">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.6 90.4-84.3 103.6-119.5-37.6-31.5-62.7-70.3-62.7-91.1zm-89.6-160.8C250.3 75.2 268 34.6 268 0c-35.5 1.5-76.8 24.3-99.7 53.9-19.8 26.6-38.3 67.2-34.9 99.8 39.4 3 71-21.7 95.7-45.8z" />
    </svg>
);

// Оригинальный логотип Google Play (цветной, состоит из 4 цветных треугольников)
const GooglePlayLogo = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.52 2.53C3.38 2.72 3.3 2.97 3.3 3.31V20.69C3.3 21.03 3.38 21.28 3.52 21.47L3.58 21.53L13.6 11.53V11.37L3.58 2.47L3.52 2.53Z" fill="#478ECC" />
        <path d="M16.93 14.88L13.6 11.53V11.37L16.93 8.03L17 8.07L20.96 10.32C22.09 10.96 22.09 12.01 20.96 12.65L17 14.84L16.93 14.88Z" fill="#FFC107" />
        <path d="M17 14.84L13.6 11.45L3.52 21.47C3.98 21.95 4.75 22.02 5.67 21.5L17 14.84Z" fill="#EA4335" />
        <path d="M17 8.07L5.67 2.41C4.75 1.89 3.98 1.95 3.52 2.44L13.6 11.45L17 8.07Z" fill="#34A853" />
    </svg>
);
const getMobileOperatingSystem = (): 'iOS' | 'Android' | 'unknown' => {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) return "Android";
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return "iOS";
    return "unknown";
};

const buildTrackingUrl = (baseUrl: string, platform: 'ios' | 'android' | 'universal'): string => {
    try {
        const url = new URL(baseUrl);
        const searchParams = new URLSearchParams(url.search);

        const refCode = getReferralCode();
        if (refCode) searchParams.set(defaultConfig.referralParamName, refCode);

        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        const utmValues: Record<string, string> = {};

        utmKeys.forEach(key => {
            const value = Cookies.get(key);
            if (value) {
                utmValues[key] = value;
                if (platform !== 'android') searchParams.set(key, value);
            }
        });

        if (platform === 'android' && Object.keys(utmValues).length > 0) {
            const referrerParams = new URLSearchParams();
            Object.entries(utmValues).forEach(([k, v]) => referrerParams.set(k, v));
            if (refCode) referrerParams.set(defaultConfig.referralParamName, refCode);
            searchParams.set('referrer', referrerParams.toString());
        }

        url.search = searchParams.toString();
        return url.toString();
    } catch (e) {
        return baseUrl;
    }
};

export default function AppRedirectPage() {
    const { t } = useTranslation();
    const [status, setStatus] = useState<'redirecting' | 'fallback'>('redirecting');
    const [os, setOs] = useState<'iOS' | 'Android' | 'unknown'>('unknown');

    // ВАЖНО: Добавим проверку, мобилка ли это в целом, чтобы лучше адаптировать UI
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    const { versionConfig } = useSelector((state: RootState) => state.config);

    const baseAppStoreUrl = versionConfig?.ios?.url || defaultConfig.appStoreUrl;
    const baseGooglePlayUrl = versionConfig?.android?.url || defaultConfig.googlePlayUrl;

    const appStoreUrl = useMemo(() => buildTrackingUrl(baseAppStoreUrl, 'ios'), [baseAppStoreUrl]);
    const googlePlayUrl = useMemo(() => buildTrackingUrl(baseGooglePlayUrl, 'android'), [baseGooglePlayUrl]);
    const universalUrl = useMemo(() => buildTrackingUrl(defaultConfig.appUniversalUrl, 'universal'), []);

    useEffect(() => {
        const currentOs = getMobileOperatingSystem();
        setOs(currentOs);

        // Простая проверка на мобильное устройство по ширине экрана (или юзерагенту)
        setIsMobileDevice(window.innerWidth <= 768 || currentOs !== 'unknown');

        // Искусственная задержка для красивого лоадера, если нужно. 
        // Обычно редирект делают сразу.
        const timer = setTimeout(() => {
            if (currentOs === 'iOS' && appStoreUrl) {
                window.location.href = appStoreUrl;
                // Если редирект не сработал через секунду, показываем fallback UI
                setTimeout(() => setStatus('fallback'), 1000);
            } else if (currentOs === 'Android' && googlePlayUrl) {
                window.location.href = googlePlayUrl;
                setTimeout(() => setStatus('fallback'), 1000);
            } else {
                setStatus('fallback');
            }
        }, 800); // Даем пользователю полсекунды увидеть экран загрузки

        return () => clearTimeout(timer);
    }, [appStoreUrl, googlePlayUrl]);

    if (status === 'redirecting') {
        return (
            <div className={style.redirectingFullscreen}>
                <motion.div
                    className={style.pulsingLogo}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    🐾
                </motion.div>
                <h2 className={style.redirectingText}>Открываем приложение...</h2>
            </div>
        );
    }

    return (
        <div className={style.pageWrapper}>
            <title>{t('appRedirect.pageTitle', 'Загрузите PetsOk')}</title>

            <div className={style.backgroundGlow}>
                <div className={style.glowBlob1}></div>
                <div className={style.glowBlob2}></div>
            </div>

            <div className={style.container}>
                {/* Левая часть: Призыв к действию */}
                <div className={style.contentSide}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={style.contentBox}
                    >
                        <div className={style.appIconWrapper}>
                            <div className={style.appIcon}>🐾</div>
                            <span className={style.appName}>PetsOk</span>
                        </div>

                        <h1 className={style.hugeTitle}>
                            Установите приложение для работы с сервисом
                        </h1>

                        <p className={style.simpleSubtitle}>
                            В приложении удобнее: чат с ситтером, карта прогулок и моментальные уведомления.
                        </p>

                        {/* Условный рендер: Если десктоп - огромный QR, если мобила - огромные кнопки */}
                        {!isMobileDevice ? (
                            <div className={style.desktopQrSection}>
                                <div className={style.qrCard}>
                                    <div className={style.qrArrow}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                                    </div>
                                    <div className={style.qrWrapper}>
                                        <QRCodeCanvas
                                            value={universalUrl}
                                            size={180}
                                            bgColor={"#ffffff"}
                                            fgColor={"#000000"}
                                            level={"H"}
                                            includeMargin={false}
                                        />
                                    </div>
                                    <div className={style.qrInstruction}>
                                        <strong>Наведите камеру телефона</strong>
                                        <span>Откройте камеру и наведите на этот код</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={style.mobileButtonsSection}>
                                <div className={style.mobileInstruction}>
                                    Нажмите кнопку ниже, чтобы скачать
                                </div>
                                <div className={style.storeButtonsGroup}>
                                    {/* Если ОС известна, показываем главную кнопку ОС первой и крупнее */}
                                    <a
                                        href={appStoreUrl}
                                        className={`${style.megaStoreBtn} ${style.appleBtn} ${os === 'Android' ? style.secondaryBtn : ''}`}
                                        target="_blank" rel="noopener noreferrer"
                                    >
                                        <AppleLogo />
                                        <div className={style.btnText}>
                                            <span className={style.btnSub}>Загрузите в</span>
                                            <span className={style.btnMain}>App Store</span>
                                        </div>
                                    </a>

                                    <a
                                        href={googlePlayUrl}
                                        className={`${style.megaStoreBtn} ${style.googleBtn} ${os === 'iOS' ? style.secondaryBtn : ''}`}
                                        target="_blank" rel="noopener noreferrer"
                                    >
                                        <GooglePlayLogo />
                                        <div className={style.btnText}>
                                            <span className={style.btnSub}>Доступно в</span>
                                            <span className={style.btnMain}>Google Play</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Правая часть: Визуал (для тупых нужно показать, КАК это выглядит) */}
                <div className={style.visualSide}>
                    <motion.div
                        className={style.phoneMockupContainer}
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
                    >
                        {/* Имитация телефона */}
                        <div className={style.phoneFrame}>
                            <div className={style.phoneNotch}></div>
                            <div className={style.phoneScreen}>
                                {/* Анимированный контент экрана */}
                                <div className={style.screenContent}>
                                    <div className={style.mapHeader}>
                                        <div className={style.statusDot}></div>
                                        <span>Прогулка идет</span>
                                    </div>

                                    {/* Анимированные сообщения */}
                                    <div className={style.chatArea}>
                                        <motion.div
                                            className={`${style.chatBubble} ${style.bubbleLeft}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1, duration: 0.5 }}
                                        >
                                            Как там наш мальчик?
                                        </motion.div>
                                        <motion.div
                                            className={`${style.chatBubble} ${style.bubbleRight}`}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 2, duration: 0.5 }}
                                        >
                                            Пописал! Идем к дому 🐶
                                        </motion.div>
                                        <motion.div
                                            className={style.photoMessage}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 2.5, duration: 0.5 }}
                                        >
                                            🏞️ Фото
                                        </motion.div>
                                    </div>

                                    {/* Фейковая кнопка внизу */}
                                    <div className={style.fakeBottomBar}>
                                        <div className={style.fakeInput}>Написать сообщение...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Плавающие "преимущества" вокруг телефона */}
                        <motion.div
                            className={`${style.floatingBadge} ${style.badge1}`}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        >
                            📸 Фото-отчеты
                        </motion.div>
                        <motion.div
                            className={`${style.floatingBadge} ${style.badge2}`}
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                        >
                            📍 Трекинг на карте
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}