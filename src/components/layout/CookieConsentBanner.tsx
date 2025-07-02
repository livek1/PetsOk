import { useState, useEffect, FC } from 'react';
import Cookies from 'js-cookie';
import style from '../../style/components/layout/CookieConsentBanner.module.scss'; // Стили будут созданы ниже
import { useTranslation } from 'react-i18next';

const COOKIE_CONSENT_KEY = 'cookie_consent_given';

const CookieConsentBanner: FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consentGiven = Cookies.get(COOKIE_CONSENT_KEY);
        if (!consentGiven) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        Cookies.set(COOKIE_CONSENT_KEY, 'true', { expires: 365, path: '/' }); // Согласие на 1 год
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className={style.cookieConsentBanner}>
            <p className={style.cookieText}>
                {t('cookieConsent.text', 'Мы используем файлы cookie, чтобы улучшить ваш опыт на нашем сайте. Оставаясь на сайте, вы соглашаетесь с нашей ')}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={style.cookieLink}>
                    {t('cookieConsent.policyLink', 'Политикой конфиденциальности и использования cookie')}
                </a>.
            </p>
            <button onClick={handleAccept} className={style.acceptButton}>
                {t('cookieConsent.acceptButton', 'Понятно')}
            </button>
        </div>
    );
};

export default CookieConsentBanner;