import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DotLottiePlayer } from '@dotlottie/react-player';
import style from '../../../../style/pages/cabinet/becomeSitter/StepStatus.module.scss';
import wizardStyle from '../BecomeSitterWizard.module.scss';

// API и Actions
import { loadUser } from '../../../../store/slices/authSlice';
import { AppDispatch } from '../../../../store';

// --- ИЗМЕНЕНИЕ: Используем пути к файлам в папке /public/animations/ ---
// Это предотвращает включение тяжелых файлов внутрь JavaScript-бандла.
// Файлы должны лежать в: public/animations/Pending.lottie и т.д.
const pendingAnimation = '/animations/Pending.lottie';
const againAnimation = '/animations/Again.lottie';
const failAnimation = '/animations/Fail.lottie';
const approveAnimation = '/animations/Approve.lottie';

// Иконки
const TelegramIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.697-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.314-.913.468-1.302.459-.428-.01-1.254-.241-1.866-.44-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.473.146.158.143.201.338.223.519.02.164.01.332.01.332z" /></svg>;
const InstagramIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;
const AlertIcon = ({ color }: { color?: string }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;

const STATUS_CONFIG: any = {
    pending: {
        color: '#3598FE',
        src: pendingAnimation,
        titleKey: 'ReviewStatus.PendingTitle',
        gradient: 'linear-gradient(180deg, #F0F4FF 0%, #FFFFFF 100%)'
    },
    again: {
        color: '#FFC107',
        src: againAnimation,
        titleKey: 'ReviewStatus.AgainTitle',
        gradient: 'linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%)'
    },
    fail: {
        color: '#F44336',
        src: failAnimation,
        titleKey: 'ReviewStatus.FailTitle',
        gradient: 'linear-gradient(180deg, #FFEBEE 0%, #FFFFFF 100%)'
    },
    approved: {
        color: '#4CAF50',
        src: approveAnimation,
        titleKey: 'ReviewStatus.ApprovedTitle',
        gradient: 'linear-gradient(180deg, #E8F5E9 0%, #FFFFFF 100%)'
    }
};

const StepStatus = ({ statusKey, details }: { statusKey: string, details: any }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const [isUpdating, setIsUpdating] = useState(false);

    const normalizedKey = statusKey?.toLowerCase() || '';

    let statusType = 'pending';
    if (normalizedKey.includes('approved')) statusType = 'approved';
    else if (normalizedKey.includes('rejected') || normalizedKey.includes('fail')) statusType = 'fail';
    else if (normalizedKey.includes('resubmission')) statusType = 'again';

    const config = STATUS_CONFIG[statusType];
    const isApproved = statusType === 'approved';
    const isResubmit = statusType === 'again';

    let defaultTitle = 'На проверке';
    if (isApproved) defaultTitle = 'Ура! Вы приняты!';
    else if (statusType === 'fail') defaultTitle = 'Анкета отклонена';
    else if (isResubmit) defaultTitle = 'Требуются исправления';

    const handleGoBack = async () => {
        if (isApproved) {
            setIsUpdating(true);
            try {
                await dispatch(loadUser()).unwrap();
            } catch (error) {
                console.error(error);
            } finally {
                setIsUpdating(false);
                navigate('/cabinet/sitter-dashboard');
            }
        } else {
            navigate('/cabinet/profile');
        }
    };

    const handleResubmit = () => {
        window.location.reload();
    };

    return (
        <div className={style.pageWrapper} style={{ background: config.gradient }}>
            <div className={wizardStyle.stepCard}>

                <div className={style.animationContainer}>
                    {/* Плеер автоматически подгрузит файл по ссылке из public */}
                    <DotLottiePlayer
                        src={config.src}
                        autoplay
                        loop={!isApproved}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>

                <h1 className={style.title} style={{ color: config.color }}>
                    {t(config.titleKey, defaultTitle) as string}
                </h1>

                <p className={style.message}>
                    {details.message || details.admin_message}
                </p>

                {details.admin_message && (
                    <div className={style.adminMessageCard} style={{ borderLeftColor: config.color }}>
                        <div className={style.adminHeader}>
                            <AlertIcon color={config.color} />
                            <span style={{ color: config.color }}>
                                {t('ReviewStatus.AdminMessagePrefix', 'Комментарий администратора:') as string}
                            </span>
                        </div>
                        <p className={style.adminText}>{details.admin_message}</p>
                    </div>
                )}

                <div className={style.actions}>
                    {isResubmit && (
                        <button className={wizardStyle.btnPrimary} onClick={handleResubmit}>
                            {t('ReviewStatus.RetrySubmissionButton', 'Исправить и отправить') as string}
                        </button>
                    )}

                    <button
                        className={style.secondaryBtn}
                        onClick={handleGoBack}
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Обновление...' : (isApproved ? t('common.goToDashboard', 'Перейти к работе') : t('ReviewStatus.GoBackButton', 'В профиль')) as string}
                    </button>
                </div>

                {(statusType === 'pending' || statusType === 'again') && (
                    <div className={style.socialCard}>
                        <h3>{t('ReviewStatus.SocialCardTitle', 'Подружимся в соцсетях? 🤗') as string}</h3>
                        <p>{t('ReviewStatus.SocialCardSubtitle', 'Пока мы проверяем анкету, заглядывайте к нам! Там много полезного.') as string}</p>

                        <div className={style.socialButtons}>
                            <a href="https://t.me/petsokru" target="_blank" rel="noreferrer" className={`${style.socialBtn} ${style.telegram}`}>
                                <TelegramIcon /> Telegram
                            </a>
                            <a href="https://www.instagram.com/petsok.ru" target="_blank" rel="noreferrer" className={`${style.socialBtn} ${style.instagram}`}>
                                <InstagramIcon /> Instagram *
                            </a>
                        </div>
                        <small className={style.disclaimer}>
                            {t('ReviewStatus.MetaDisclaimer', '* Деятельность Meta Platforms Inc. (Facebook, Instagram) запрещена на территории РФ как экстремистская.') as string}
                        </small>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StepStatus;