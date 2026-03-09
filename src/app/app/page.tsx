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

// SVG Логотипы
const AppleLogo = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 12 0 14 0C14 0 14 2 12 2ZM12 4C8.686 4 6 6.686 6 10C6 15.5 12 22 12 22C12 22 18 15.5 18 10C18 6.686 15.314 4 12 4Z" /></svg>;
const GooglePlayLogo = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M3 2L21 12L3 22V2Z" /></svg>;

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