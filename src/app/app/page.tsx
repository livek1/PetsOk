"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { RootState } from '../../store'; // Проверьте правильность пути к вашему store
import { config as defaultConfig } from '../../config/appConfig'; // Проверьте правильность пути к конфигу
import style from '../../style/pages/AppRedirectPage.module.scss';

// Т.к. App.tsx больше нет, переносим функцию получения реферального кода сюда
const getReferralCode = (): string | undefined => {
    return Cookies.get(defaultConfig.referralParamName);
};

// Заглушки для логотипов (если у вас есть свои компоненты, замените пути на них)
const AppleLogo = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 12 0 14 0C14 0 14 2 12 2ZM12 4C8.686 4 6 6.686 6 10C6 15.5 12 22 12 22C12 22 18 15.5 18 10C18 6.686 15.314 4 12 4Z" /></svg>; // Упрощенная SVG, замените импортом если нужно
const GooglePlayLogo = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 2L21 12L3 22V2Z" /></svg>; // Упрощенная SVG, замените импортом если нужно

// Иконки преимуществ
const ChatIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>;
const MapIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>;
const BellIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;

const getMobileOperatingSystem = (): 'iOS' | 'Android' | 'unknown' => {
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
    const { versionConfig } = useSelector((state: RootState) => state.config);

    const baseAppStoreUrl = versionConfig?.ios?.url || defaultConfig.appStoreUrl;
    const baseGooglePlayUrl = versionConfig?.android?.url || defaultConfig.googlePlayUrl;

    const appStoreUrl = useMemo(() => buildTrackingUrl(baseAppStoreUrl, 'ios'), [baseAppStoreUrl]);
    const googlePlayUrl = useMemo(() => buildTrackingUrl(baseGooglePlayUrl, 'android'), [baseGooglePlayUrl]);
    const universalUrl = useMemo(() => buildTrackingUrl(defaultConfig.appUniversalUrl, 'universal'), []);

    useEffect(() => {
        const os = getMobileOperatingSystem();
        if (os === 'iOS' && appStoreUrl) {
            window.location.href = appStoreUrl;
        } else if (os === 'Android' && googlePlayUrl) {
            window.location.href = googlePlayUrl;
        } else {
            setStatus('fallback');
        }
    }, [appStoreUrl, googlePlayUrl]);

    if (status === 'redirecting') {
        return (
            <div className={style.redirectContainer}>
                <div className={style.loader}></div>
                <p>{t('appRedirect.redirecting', 'Перенаправляем в магазин приложений...')}</p>
            </div>
        );
    }

    const features = [
        { icon: <ChatIcon />, title: "Чат с ситтером", desc: "Всегда на связи, фото и видео отчеты" },
        { icon: <MapIcon />, title: "Трекинг прогулок", desc: "Следите за маршрутом прогулки на карте" },
        { icon: <BellIcon />, title: "Уведомления", desc: "Мгновенные пуши о начале и конце услуги" },
    ];

    return (
        <div className={style.pageWrapper}>
            <title>{t('appRedirect.pageTitle', 'Загрузите приложение PetsOk')}</title>

            <div className={style.container}>
                <div className={style.contentSide}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className={style.logoBadge}>PetsOk App</div>
                        <h1 className={style.title}>
                            {t('appRedirect.heroTitle', 'Весь уход за питомцем в вашем кармане')}
                        </h1>
                        <p className={style.description}>
                            {t('appRedirect.subtitle', 'Скачайте приложение для доступа к трекингу прогулок, быстрым чатам и уведомлениям о статусе заказа.')}
                        </p>

                        <div className={style.featuresList}>
                            {features.map((f, i) => (
                                <div key={i} className={style.featureItem}>
                                    <div className={style.featureIcon}>{f.icon}</div>
                                    <div className={style.featureText}>
                                        <strong>{f.title}</strong>
                                        <span>{f.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={style.downloadBlock}>
                            <div className={style.qrBlock}>
                                <div className={style.qrWrapper}>
                                    <QRCodeCanvas
                                        value={universalUrl}
                                        size={100}
                                        bgColor={"#ffffff"}
                                        fgColor={"#1A202C"}
                                        level={"M"}
                                    />
                                </div>
                                <span className={style.qrLabel}>Наведите камеру<br />для скачивания</span>
                            </div>

                            <div className={style.storeButtons}>
                                <a href={appStoreUrl} className={style.storeBtn} target="_blank" rel="noopener noreferrer">
                                    <AppleLogo />
                                    <div className={style.btnText}>
                                        <small>Загрузите в</small>
                                        <span>App Store</span>
                                    </div>
                                </a>
                                <a href={googlePlayUrl} className={style.storeBtn} target="_blank" rel="noopener noreferrer">
                                    <GooglePlayLogo />
                                    <div className={style.btnText}>
                                        <small>Доступно в</small>
                                        <span>Google Play</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className={style.visualSide}>
                    <motion.div
                        className={style.phoneMockup}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className={style.screenContent}>
                            <div className={style.appHeader}>
                                <div className={style.bubble}>Привет! 👋</div>
                                <div className={style.bubble}>Как там Бобик?</div>
                            </div>
                            <div className={style.appCard}>
                                <div className={style.cardMapPlaceholder}>
                                    📍 Прогулка началась
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className={style.blob1}></div>
                    <div className={style.blob2}></div>
                </div>
            </div>
        </div>
    );
}