import React, { useEffect, useState } from 'react';
import ReactDOM from "react-dom";
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { config as defaultConfig } from '../../config/appConfig';
import style from '../../style/components/modals/OrderCreatedModal.module.scss';
import { getReferralCode } from '../../App';

// Логотипы
import AppleLogo from '../logos/AppleLogo';
import GooglePlayLogo from '../logos/GooglePlayLogo';

// Иконка
const CheckCircleIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

interface OrderCreatedModalProps {
    isOpen: boolean;
    onClose: () => void;
}

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

const OrderCreatedModal: React.FC<OrderCreatedModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { versionConfig } = useSelector((state: RootState) => state.config);
    const [mounted, setMounted] = useState(false);

    const [appStoreUrl, setAppStoreUrl] = useState(defaultConfig.appStoreUrl);
    const [googlePlayUrl, setGooglePlayUrl] = useState(defaultConfig.googlePlayUrl);
    const [universalUrl, setUniversalUrl] = useState(defaultConfig.appUniversalUrl);

    useEffect(() => {
        setMounted(true);
        const baseAppStore = versionConfig?.ios?.url || defaultConfig.appStoreUrl;
        const baseGooglePlay = versionConfig?.android?.url || defaultConfig.googlePlayUrl;
        const baseUniversal = defaultConfig.appUniversalUrl;

        setAppStoreUrl(buildTrackingUrl(baseAppStore, 'ios'));
        setGooglePlayUrl(buildTrackingUrl(baseGooglePlay, 'android'));
        setUniversalUrl(buildTrackingUrl(baseUniversal, 'universal'));
    }, [versionConfig]);

    if (!isOpen || !mounted) return null;

    const modalRoot = document.getElementById('modal-root') || document.body;

    return ReactDOM.createPortal(
        <div className={style.overlay}>
            <div className={style.modal}>
                <div className={style.iconWrapper}>
                    <CheckCircleIcon />
                </div>

                <h2 className={style.title}>
                    {t('orderCreated.title', 'Заказ успешно создан!')}
                </h2>
                <p className={style.subtitle}>
                    {t('orderCreated.subtitle', 'Мы уже оповестили ситтеров поблизости. Обычно первые отклики приходят в течение 15 минут.')}
                </p>

                <div className={style.appPromoBlock}>
                    <p className={style.appText}>
                        {t('orderCreated.appText', 'Скачайте приложение, чтобы мгновенно получать уведомления о новых откликах:')}
                    </p>

                    <div className={style.qrContainer}>
                        <QRCodeCanvas
                            value={universalUrl}
                            size={120}
                            level="M"
                            bgColor="#ffffff"
                            fgColor="#1A202C"
                        />
                    </div>

                    <div className={style.storeButtons}>
                        <a href={appStoreUrl} target="_blank" rel="noopener noreferrer" className={style.storeBtn}>
                            <AppleLogo />
                            <div className={style.btnText}>
                                <small>App Store</small>
                                <span>Загрузить</span>
                            </div>
                        </a>
                        <a href={googlePlayUrl} target="_blank" rel="noopener noreferrer" className={style.storeBtn}>
                            <GooglePlayLogo />
                            <div className={style.btnText}>
                                <small>Google Play</small>
                                <span>Загрузить</span>
                            </div>
                        </a>
                    </div>
                </div>

                <button onClick={onClose} className={style.skipBtn}>
                    {t('orderCreated.skipButton', 'Перейти к моим заказам')} &rarr;
                </button>
            </div>
        </div>,
        modalRoot
    );
};

export default OrderCreatedModal;