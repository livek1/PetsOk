// --- File: src/pages/cabinet/SitterDashboard.tsx ---
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import Cookies from 'js-cookie'; // Импорт Cookies
import { RootState } from '../../store';
import { config as defaultConfig } from '../../config/appConfig';
import style from '../../style/pages/cabinet/SitterDashboard.module.scss';
import { getReferralCode } from '../../App'; // Импорт хелпера для рефки

// Логотипы магазинов
import AppleLogo from '../../components/logos/AppleLogo';
import GooglePlayLogo from '../../components/logos/GooglePlayLogo';

// Иконки преимуществ
const ChatIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const MapIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>;
const BellIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;

// Хелпер для UTM (можно вынести в отдельный файл utils, но для полноты кода оставляю здесь)
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

const SitterDashboard = () => {
    const { t } = useTranslation();
    const { user } = useSelector((state: RootState) => state.auth);
    const { versionConfig } = useSelector((state: RootState) => state.config);

    const [appStoreUrl, setAppStoreUrl] = useState(defaultConfig.appStoreUrl);
    const [googlePlayUrl, setGooglePlayUrl] = useState(defaultConfig.googlePlayUrl);
    const [universalUrl, setUniversalUrl] = useState(defaultConfig.appUniversalUrl);

    // Обновляем ссылки при загрузке компонента или конфига
    useEffect(() => {
        const baseAppStore = versionConfig?.ios?.url || defaultConfig.appStoreUrl;
        const baseGooglePlay = versionConfig?.android?.url || defaultConfig.googlePlayUrl;
        const baseUniversal = defaultConfig.appUniversalUrl;

        setAppStoreUrl(buildTrackingUrl(baseAppStore, 'ios'));
        setGooglePlayUrl(buildTrackingUrl(baseGooglePlay, 'android'));
        setUniversalUrl(buildTrackingUrl(baseUniversal, 'universal'));
    }, [versionConfig]);

    if (!user?.isSitter) {
        return (
            <div className={style.container}>
                <div className={style.emptyState}>
                    <h2>{t('cabinet.becomeSitterTitle', 'Станьте частью команды!')}</h2>
                    <p>{t('cabinet.becomeSitterText', 'Вы еще не зарегистрированы как ситтер.')}</p>
                    <a href="/cabinet/become-sitter" className={style.primaryBtn}>
                        {t('header.becomeSitter', 'Стать ситтером')}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={style.container}>
            <div className={style.promoCard}>
                <div className={style.contentSide}>
                    <div className={style.badge}>Для исполнителей</div>

                    <h1 className={style.title}>
                        {t('sitterDashboard.promoTitle', 'Управление заказами — в мобильном приложении')}
                    </h1>

                    <p className={style.description}>
                        {t('sitterDashboard.promoDesc', 'Мы перенесли инструменты ситтера в приложение для вашего удобства. Принимайте заказы, отправляйте фотоотчеты и получайте выплаты прямо с телефона.')}
                    </p>

                    <div className={style.features}>
                        <div className={style.featureItem}>
                            <div className={style.iconCircle}><ChatIcon /></div>
                            <span>{t('sitterDashboard.featureChat', 'Быстрые чаты')}</span>
                        </div>
                        <div className={style.featureItem}>
                            <div className={style.iconCircle}><MapIcon /></div>
                            <span>{t('sitterDashboard.featureMap', 'GPS трекинг')}</span>
                        </div>
                        <div className={style.featureItem}>
                            <div className={style.iconCircle}><BellIcon /></div>
                            <span>{t('sitterDashboard.featurePush', 'Пуш-уведомления')}</span>
                        </div>
                    </div>

                    <div className={style.storeButtons}>
                        <a href={appStoreUrl} target="_blank" rel="noopener noreferrer" className={style.storeBtn}>
                            <AppleLogo />
                            <div className={style.btnText}>
                                <small>Загрузите в</small>
                                <span>App Store</span>
                            </div>
                        </a>
                        <a href={googlePlayUrl} target="_blank" rel="noopener noreferrer" className={style.storeBtn}>
                            <GooglePlayLogo />
                            <div className={style.btnText}>
                                <small>Доступно в</small>
                                <span>Google Play</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className={style.qrSide}>
                    <div className={style.qrWrapper}>
                        <QRCodeCanvas
                            value={universalUrl}
                            size={160}
                            bgColor={"#ffffff"}
                            fgColor={"#1A202C"}
                            level={"M"}
                            imageSettings={{
                                src: "/logo192.png", // Логотип должен быть в public/
                                x: undefined,
                                y: undefined,
                                height: 34,
                                width: 34,
                                excavate: true,
                            }}
                        />
                        <p>{t('sitterDashboard.scanToDownload', 'Наведите камеру для скачивания')}</p>
                    </div>
                    {/* Декоративный телефон (CSS) */}
                    <div className={style.phoneMockup} />
                </div>
            </div>

            {/* Блок статистики (Read-only для веба) */}
            <div className={style.statsSection}>
                <h3>{t('sitterDashboard.statsTitle', 'Ваша статистика')}</h3>
                <div className={style.statsGrid}>
                    <div className={style.statCard}>
                        <span className={style.statValue}>0 ₽</span>
                        <span className={style.statLabel}>{t('workerDashboard.earnedLast30Days', 'Заработано (30д)')}</span>
                    </div>
                    <div className={style.statCard}>
                        <span className={style.statValue}>5.0</span>
                        <span className={style.statLabel}>{t('workerDashboard.rating', 'Рейтинг')}</span>
                    </div>
                    <div className={style.statCard}>
                        <span className={style.statValue}>0</span>
                        <span className={style.statLabel}>{t('workerDashboard.completed', 'Завершено')}</span>
                    </div>
                </div>
                <p className={style.note}>
                    * {t('sitterDashboard.fullStatsInApp', 'Полная статистика и история выплат доступны в приложении.')}
                </p>
            </div>
        </div>
    );
};

export default SitterDashboard;