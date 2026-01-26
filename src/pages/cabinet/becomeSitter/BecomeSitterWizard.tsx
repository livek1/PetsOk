// --- File: src/pages/cabinet/becomeSitter/BecomeSitterWizard.tsx ---
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkerStatus } from '../../../services/api';
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

const BecomeSitterWizard: React.FC = () => {
    const navigate = useNavigate();
    const [statusData, setStatusData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // 1. ДОБАВЛЕНО: Локальное состояние для пропуска подписки
    const [isSubscriptionSkipped, setIsSubscriptionSkipped] = useState(false);

    const refreshStatus = () => {
        setLoading(true);
        setRefreshTrigger(prev => prev + 1);
    };

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await getWorkerStatus();
                // console.log("Worker Status Response:", data);
                setStatusData(data);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setStatusData({ current_stage_key: STAGE_KEYS.APPLICATION_NOT_STARTED });
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
        return <div className={style.centerLoader}>Загрузка статуса...</div>;
    }

    if (!statusData) return <div>Ошибка загрузки данных.</div>;

    const stage = statusData.current_stage_key?.toLowerCase();
    const details = statusData.details || {};

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

            // 2. ИЗМЕНЕНО: Логика отображения подписки или профиля
            case STAGE_KEYS.SUBSCRIPTION_OFFER_PENDING:
                // Если пользователь нажал "Пропустить", мы визуально показываем StepProfile.
                // Когда он заполнит профиль и нажмет "Сохранить", вызовется refreshStatus.
                // Тогда бэкенд увидит, что профиль создан, и сам переключит статус дальше.
                if (isSubscriptionSkipped) {
                    return <StepProfile onNext={refreshStatus} isResubmission={false} />;
                }
                // Передаем функцию переключения флага вместо refreshStatus
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