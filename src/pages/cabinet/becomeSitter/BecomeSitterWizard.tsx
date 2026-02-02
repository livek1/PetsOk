// --- File: src/pages/cabinet/becomeSitter/BecomeSitterWizard.tsx ---
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { QRCodeCanvas } from 'qrcode.react';
import Cookies from 'js-cookie';
import { getWorkerStatus } from '../../../services/api';
import { config as appConfig } from '../../../config/appConfig';
import { RootState } from '../../../store';
import { getReferralCode } from '../../../App';
import style from './BecomeSitterWizard.module.scss';

// Импорт шагов
import StepLocation from './steps/StepLocation';
import StepKYC from './steps/StepKYC';
import StepTests from './steps/StepTests';
import StepServices from './steps/StepServices';
import StepAddCard from './steps/StepAddCard';
import StepSubscription from './steps/StepSubscription';
import StepProfile from './steps/StepProfile';
import StepStatus from './steps/StepStatus';

// Логотипы
import AppleLogo from '../../../components/logos/AppleLogo';
import GooglePlayLogo from '../../../components/logos/GooglePlayLogo';

// Константы статусов
const STAGE_KEYS = {
    APPLICATION_NOT_STARTED: 'application_not_started',
    KYC_SUBMISSION_PENDING: 'kyc_submission_pending',
    KYC_RESUBMISSION_REQUIRED: 'kyc_resubmission_required',
    GENERAL_TESTS_PENDING: 'general_tests_pending',
    SERVICE_SETTINGS_PENDING_SUBMISSION: 'service_settings_pending_submission',
    CARD_SETUP_PENDING: 'card_setup_pending',
    SUBSCRIPTION_OFFER_PENDING: 'subscription_offer_pending',
    ADDITIONAL_PROFILE_PENDING_SUBMISSION: 'additional_profile_pending_submission',
    ADDITIONAL_PROFILE_RESUBMISSION_REQUIRED: 'additional_profile_resubmission_required',

    // Статусы ожидания
    KYC_PENDING_REVIEW: 'kyc_pending_review',
    ADDITIONAL_PROFILE_PENDING_REVIEW: 'additional_profile_pending_review',
    APPLICATION_PENDING_ADMIN_REVIEW: 'application_pending_admin_review',
    APPLICATION_APPROVED_BY_ADMIN: 'application_approved_by_admin',
};

// Хелпер для UTM и реферальных ссылок
const buildTrackingUrl = (baseUrl: string, platform: 'ios' | 'android' | 'universal'): string => {
    try {
        const url = new URL(baseUrl);
        const searchParams = new URLSearchParams(url.search);

        const refCode = getReferralCode();
        if (refCode) searchParams.set(appConfig.referralParamName, refCode);

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
            if (refCode) referrerParams.set(appConfig.referralParamName, refCode);
            searchParams.set('referrer', referrerParams.toString());
        }

        url.search = searchParams.toString();
        return url.toString();
    } catch (e) {
        return baseUrl;
    }
};

const BecomeSitterWizard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { versionConfig } = useSelector((state: RootState) => state.config);

    const [statusData, setStatusData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Состояние для промо-экрана приложения
    const [showAppPromo, setShowAppPromo] = useState(false);
    const [isSubscriptionSkipped, setIsSubscriptionSkipped] = useState(false);

    // Состояние для динамических ссылок
    const [appStoreUrl, setAppStoreUrl] = useState(appConfig.appStoreUrl);
    const [googlePlayUrl, setGooglePlayUrl] = useState(appConfig.googlePlayUrl);
    const [universalUrl, setUniversalUrl] = useState(appConfig.appUniversalUrl);

    // Обновляем ссылки при загрузке компонента или конфига (Логика из Dashboard)
    useEffect(() => {
        const baseAppStore = versionConfig?.ios?.url || appConfig.appStoreUrl;
        const baseGooglePlay = versionConfig?.android?.url || appConfig.googlePlayUrl;
        const baseUniversal = appConfig.appUniversalUrl;

        setAppStoreUrl(buildTrackingUrl(baseAppStore, 'ios'));
        setGooglePlayUrl(buildTrackingUrl(baseGooglePlay, 'android'));
        setUniversalUrl(buildTrackingUrl(baseUniversal, 'universal'));
    }, [versionConfig]);

    const refreshStatus = () => {
        setLoading(true);
        setRefreshTrigger(prev => prev + 1);
    };

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await getWorkerStatus();
                setStatusData(data);

                // Если анкета еще не начата, показываем предложение скачать приложение
                if (data.current_stage_key === STAGE_KEYS.APPLICATION_NOT_STARTED) {
                    setShowAppPromo(true);
                }
            } catch (error: any) {
                if (error.response?.status === 404) {
                    const data = { current_stage_key: STAGE_KEYS.APPLICATION_NOT_STARTED };
                    setStatusData(data);
                    setShowAppPromo(true);
                } else {
                    console.error("Status fetch error", error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [refreshTrigger]);

    if (loading) {
        return <div className={style.centerLoader}>{t('loading', 'Загрузка...')}</div>;
    }

    if (!statusData) return <div>Ошибка загрузки данных.</div>;

    const stage = statusData.current_stage_key?.toLowerCase();
    const details = statusData.details || {};

    // --- ЭКРАН: ПРЕДЛОЖЕНИЕ СКАЧАТЬ ПРИЛОЖЕНИЕ ---
    if (showAppPromo && stage === STAGE_KEYS.APPLICATION_NOT_STARTED) {
        return (
            <div className={style.appPromoContainer}>
                <div className={style.appPromoCard}>
                    <div className={style.appPromoHeader}>
                        <h2>📱 {t('becomeSitter.appPromo.title', 'В приложении удобнее!')}</h2>
                        <p>{t('becomeSitter.appPromo.subtitle', 'Загружать фото, проходить проверку личности и получать уведомления о заказах гораздо проще через мобильное приложение PetsOk.')}</p>
                    </div>

                    <div className={style.promoContent}>
                        {/* QR-код скрывается на мобильных через CSS */}
                        <div className={style.qrSection}>
                            <div className={style.qrWrapper}>
                                <QRCodeCanvas
                                    value={universalUrl}
                                    size={140}
                                    level="M"
                                    imageSettings={{
                                        src: "/favicon.ico", // Опционально: логотип в центре QR
                                        x: undefined,
                                        y: undefined,
                                        height: 24,
                                        width: 24,
                                        excavate: true,
                                    }}
                                />
                            </div>
                            <span className={style.qrLabel}>{t('becomeSitter.appPromo.scanToDownload', 'Наведите камеру, чтобы скачать')}</span>
                        </div>

                        <div className={style.storeButtons}>
                            <a href={appStoreUrl} target="_blank" rel="noreferrer" className={style.storeBtn}>
                                <div className={style.btnIcon}><AppleLogo /></div>
                                <div className={style.btnText}>
                                    <span className={style.small}>Download on the</span>
                                    <span className={style.large}>App Store</span>
                                </div>
                            </a>
                            <a href={googlePlayUrl} target="_blank" rel="noreferrer" className={style.storeBtn}>
                                <div className={style.btnIcon}><GooglePlayLogo /></div>
                                <div className={style.btnText}>
                                    <span className={style.small}>GET IT ON</span>
                                    <span className={style.large}>Google Play</span>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className={style.divider}>
                        <span>{t('common.or', 'или')}</span>
                    </div>

                    <div className={style.secondaryAction}>
                        <button className={style.secondaryBtn} onClick={() => setShowAppPromo(false)}>
                            {t('becomeSitter.appPromo.continueWeb', 'Я хочу продолжить в браузере')}
                        </button>
                        <p className={style.secondaryHint}>
                            {t('becomeSitter.appPromo.webHint', 'Вы сможете скачать приложение позже в любой момент')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- ЛОГИКА ШАГОВ ---
    const renderStep = () => {
        switch (stage) {
            case STAGE_KEYS.APPLICATION_NOT_STARTED:
                return <StepLocation onNext={refreshStatus} />;

            case STAGE_KEYS.KYC_SUBMISSION_PENDING:
            case STAGE_KEYS.KYC_RESUBMISSION_REQUIRED:
                return <StepKYC onNext={refreshStatus} isResubmission={stage === STAGE_KEYS.KYC_RESUBMISSION_REQUIRED} adminMessage={details.admin_message} />;

            case STAGE_KEYS.GENERAL_TESTS_PENDING:
                return <StepTests onNext={refreshStatus} />;

            case STAGE_KEYS.SERVICE_SETTINGS_PENDING_SUBMISSION:
                return <StepServices onNext={refreshStatus} />;

            case STAGE_KEYS.CARD_SETUP_PENDING:
                return <StepAddCard onNext={refreshStatus} />;

            case STAGE_KEYS.SUBSCRIPTION_OFFER_PENDING:
                if (isSubscriptionSkipped) {
                    return <StepProfile onNext={refreshStatus} isResubmission={false} />;
                }
                return <StepSubscription onNext={() => setIsSubscriptionSkipped(true)} />;

            case STAGE_KEYS.ADDITIONAL_PROFILE_PENDING_SUBMISSION:
            case STAGE_KEYS.ADDITIONAL_PROFILE_RESUBMISSION_REQUIRED:
                return <StepProfile onNext={refreshStatus} isResubmission={stage === STAGE_KEYS.ADDITIONAL_PROFILE_RESUBMISSION_REQUIRED} adminMessage={details.admin_message} />;

            case STAGE_KEYS.KYC_PENDING_REVIEW:
            case STAGE_KEYS.ADDITIONAL_PROFILE_PENDING_REVIEW:
            case STAGE_KEYS.APPLICATION_PENDING_ADMIN_REVIEW:
            case STAGE_KEYS.APPLICATION_APPROVED_BY_ADMIN:
            default:
                if (stage?.includes('rejected') || stage?.includes('fail')) {
                    return <StepStatus statusKey={stage} details={details} />;
                }
                return <StepStatus statusKey={stage} details={details} />;
        }
    };

    return (
        <div className={style.wizardContainer}>
            {renderStep()}
        </div>
    );
};

export default BecomeSitterWizard;