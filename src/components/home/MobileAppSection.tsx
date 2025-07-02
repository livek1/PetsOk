import React, { useState, useEffect, FC } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import "../../style/components/MobileAppPromoSection.scss";

// Импортируем ваши SVG логотипы
import GooglePlayLogo from '../logos/GooglePlayLogo';
import AppleLogo from '../logos/AppleLogo';

// Импортируем конфиг и функцию для получения реф. кода
import { config } from '../../config/appConfig';
import { getReferralCode } from "../../App";

// --- ИЗМЕНЕНИЕ 1: Локальное видео полностью удалено из импортов ---
// import appDemoVideo from '../../assets/appdemo.mov'; // <--- ЭТА СТРОКА УДАЛЕНА

// --- Иконки для фич приложения ---
const EasySearchIcon: FC = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>);
const InstantChatIcon: FC = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" /></svg>);
const PhotoUpdatesAppIcon: FC = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>);
const BookingManageIcon: FC = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 16H7V8h10v11zM9 10h2v2H9zm4 0h2v2h-2zm-4 3h2v2H9zm4 0h2v2h-2z" /></svg>);
// --- Конец иконок ---

const MOBILE_BREAKPOINT = 768;

// Утилита для добавления параметра к URL
const addQueryParamToUrl = (url: string, paramName: string, paramValue: string): string => {
    if (!paramValue) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${paramName}=${paramValue}`;
};

const MobileAppPromoSection: React.FC = () => {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(false);

    // --- ИЗМЕНЕНИЕ 2: Прямые ссылки на CDN ---
    const videoUrl = "https://petsok.fra1.cdn.digitaloceanspaces.com/frontend/appdemo.mp4";
    const posterUrl = "https://petsok.fra1.cdn.digitaloceanspaces.com/frontend/app-poster.jpg"; // Убедитесь, что вы создали и загрузили этот файл!

    const [finalUniversalAppUrl, setFinalUniversalAppUrl] = useState(config.appUniversalUrl);
    const [finalAppStoreUrl, setFinalAppStoreUrl] = useState(config.appStoreUrl);
    const [finalGooglePlayUrl, setFinalGooglePlayUrl] = useState(config.googlePlayUrl);


    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const refCode = getReferralCode();
        if (refCode) {
            setFinalUniversalAppUrl(addQueryParamToUrl(config.appUniversalUrl, config.referralParamName, refCode));
            setFinalAppStoreUrl(addQueryParamToUrl(config.appStoreUrl, config.referralParamName, refCode));
            setFinalGooglePlayUrl(addQueryParamToUrl(config.googlePlayUrl, config.referralParamName, refCode));
        } else {
            setFinalUniversalAppUrl(config.appUniversalUrl);
            setFinalAppStoreUrl(config.appStoreUrl);
            setFinalGooglePlayUrl(config.googlePlayUrl);
        }
    }, []);


    const appFeatures = [
        { icon: <EasySearchIcon />, titleKey: "mobileAppPromo.features.search" },
        { icon: <InstantChatIcon />, titleKey: "mobileAppPromo.features.chat" },
        { icon: <PhotoUpdatesAppIcon />, titleKey: "mobileAppPromo.features.photos" },
        { icon: <BookingManageIcon />, titleKey: "mobileAppPromo.features.manage" },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    };

    const itemVariantsLeft = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    const videoVariants = {
        hidden: { opacity: 0, x: 20, scale: 0.95 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.1 } },
    };

    const qrVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", delay: 0.2 } },
    };


    return (
        <motion.section
            className="mobile-app-promo-section wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <div className="mobile-app-promo-section__main-title-wrapper">
                <motion.h2 variants={itemVariantsLeft}>
                    {t("mobileAppPromo.sectionTitle", "PetsOk в вашем кармане: Максимум удобства для вас и вашего любимца!")}
                </motion.h2>
            </div>

            <div className="mobile-app-promo-section__content">
                <motion.div className="mobile-app-promo-section__info-block">
                    <motion.h3 variants={itemVariantsLeft}>
                        {t("mobileAppPromo.featuresTitle", "Всё для вашего удобства в приложении:")}
                    </motion.h3>
                    <ul className="features-list">
                        {appFeatures.map((feature, index) => (
                            <motion.li
                                key={feature.titleKey}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.8 }}
                                variants={itemVariantsLeft}
                                transition={{ delay: index * 0.08 + 0.2 }}
                            >
                                <span className="feature-icon">{feature.icon}</span>
                                <span className="feature-title">{t(feature.titleKey)}</span>
                            </motion.li>
                        ))}
                    </ul>

                    <motion.p className="mobile-app-promo-section__cta-text" variants={itemVariantsLeft} transition={{ delay: 0.4 }}>
                        {t("mobileAppPromo.ctaText", "Установите приложение PetsOk сегодня и сделайте заботу о питомце проще, чем когда-либо!")}
                    </motion.p>

                    <motion.div className="download-buttons-wrapper" variants={itemVariantsLeft} transition={{ delay: 0.5 }}>
                        <div className="download-buttons">
                            <motion.a
                                className="download-button apple"
                                href={finalAppStoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05, y: -3, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.2)" }}
                                whileTap={{ scale: 0.97 }}
                                aria-label={t("mobileApp.downloadIOS", "Загрузите в App Store")}
                            >
                                <AppleLogo />
                                <span>{t("mobileApp.downloadIOSShort", "App Store")}</span>
                            </motion.a>
                            <motion.a
                                className="download-button google"
                                href={finalGooglePlayUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05, y: -3, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.2)" }}
                                whileTap={{ scale: 0.97 }}
                                aria-label={t("mobileApp.downloadAndroid", "Доступно в Google Play")}
                            >
                                <GooglePlayLogo />
                                <span>{t("mobileApp.downloadAndroidShort", "Google Play")}</span>
                            </motion.a>
                        </div>
                    </motion.div>
                    <motion.p className="mobile-app-promo-section__availability-note" variants={itemVariantsLeft} transition={{ delay: 0.6 }}>
                        {t("mobileAppPromo.availabilityNote", "Бесплатно для iOS и Android")}
                    </motion.p>
                </motion.div>

                <motion.div className="mobile-app-promo-section__qr-center-block" variants={qrVariants}>
                    <div className="qr-code-item">
                        <QRCodeCanvas
                            value={finalUniversalAppUrl}
                            size={120}
                            level="H"
                            includeMargin={false}
                            bgColor="#ffffff"
                            fgColor="#1A202C"
                        />
                        <p className="qr-code-cta-text">
                            <strong>{t("mobileAppPromo.scanToDownloadStrong", "Сканируйте")}</strong>
                            {t("mobileAppPromo.scanToDownloadRest", " для загрузки!")}
                        </p>
                    </div>
                </motion.div>

                {!isMobile && (
                    <motion.div className="mobile-app-promo-section__video-block" variants={videoVariants}>
                        <div className="phone-video-wrapper">
                            {/* --- ИЗМЕНЕНИЕ 3: Полностью обновленный тег <video> --- */}
                            <video
                                className="phone-mockup-video"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                poster={posterUrl}
                                aria-label={t("mobileAppPromo.videoAlt", "Демонстрация мобильного приложения PetsOk")}
                            >
                                <source src={videoUrl} type="video/mp4" />
                                Ваш браузер не поддерживает тэг video.
                            </video>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.section>
    );
};

export default MobileAppPromoSection;