import React, { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import style from '../../style/pages/cabinet/CabinetOrders.module.scss';
import { useNavigate } from 'react-router-dom';

// --- ИМПОРТ ФИРМЕННЫХ ИКОНОК ---
import BoardingIcon from '../icons/BoardingIcon';
import DogWalkingIcon from '../icons/DogWalkingIcon';
import DropInVisitsIcon from '../icons/DropInVisitsIcon';
import DoggyDayCareIcon from '../icons/DoggyDayCareIcon';
import HouseSittingIcon from '../icons/HouseSittingIcon';

// Стандартные SVG иконки для UI
const HourglassIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2v20h16V2H4zm8 9l-4 4h8l-4-4zm0-9l4 4H8l4-4z" /></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const CardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const PlayIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>;
const PawIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /><circle cx="12" cy="12" r="3" /><path d="M12 15a3 3 0 0 0 3-3 3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3z" /></svg>;
const CloseIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const AlertIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const PersonIcon = ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const WalletIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const ListIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const StarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>;

// --- CONSTANTS ---
const ORDER_STATUS = {
    PENDING_WORKER: 'pending_worker',
    PENDING_PLATFORM_PAYMENT: 'pending_platform_payment',
    PENDING_PLATFORM_FEE: 'pending_platform_fee',
    RECURRING_PAYMENT_FAILED: 'recurring_payment_failed',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELED_CLIENT: 'canceled_client',
    CANCELED_WORKER: 'canceled_worker',
    CANCELED_ADMIN: 'canceled_admin',
    DISPUTED: 'disputed',
};
const SERVICE_TYPE = {
    BOARDING: 'boarding',
    HOUSE_SITTING: 'house_sitting',
    DROP_IN_VISIT: 'drop_in_visit',
    DOGGY_DAY_CARE: 'doggy_day_care',
    WALKING: 'walking',
};
const PAYMENT_FLOW = {
    PLATFORM_PREPAY: 'platform_prepay',
    PLATFORM_FEE_ONLY: 'platform_fee_only',
    DIRECT_TO_WORKER: 'direct_to_worker',
};
const BILLING_PERIOD_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    PENDING_PAYMENT: 'pending_payment',
    PAYMENT_FAILED: 'payment_failed'
};
const REQUEST_TYPE = {
    WORKER_OFFER: 'worker_offer',
    CLIENT_INVITE: 'client_invite',
    ADMIN_SUGGESTION: 'admin_suggestion',
};
const REQUEST_STATUS = {
    PENDING: 'pending',
    AWAITING_CLIENT: 'awaiting_client_confirmation'
};

// --- Helpers ---
const formatDate = (dateStr: string | undefined | null): string => { moment.locale('ru'); return dateStr ? moment(dateStr).format('D MMM YYYY') : ''; }
const formatFullDate = (dateStr: string | undefined | null): string => { moment.locale('ru'); return dateStr ? moment(dateStr).format('LL') : ''; }
const formatPrice = (amount: string | number | null | undefined, currency: string | null | undefined): string | null => { if (amount === null || amount === undefined) return null; const num = parseFloat(String(amount)); if (isNaN(num)) return null; const symbol = currency === 'RUB' ? '₽' : (currency || ''); const formattedNum = num.toFixed(2).replace(/\.00$/, ''); return `${formattedNum} ${symbol} `.trim(); };

const getStatusInfo = (status?: string) => { switch (status) { case ORDER_STATUS.PENDING_WORKER: return { textKey: 'orderStatus.new', className: style.statusWarning, Icon: HourglassIcon }; case ORDER_STATUS.CONFIRMED: return { textKey: 'orderStatus.confirmed', className: style.statusSuccess, Icon: CheckIcon }; case ORDER_STATUS.IN_PROGRESS: return { textKey: 'orderStatus.inProgress', className: style.statusInfo, Icon: PlayIcon }; case ORDER_STATUS.COMPLETED: return { textKey: 'orderStatus.completed', className: style.statusSuccess, Icon: PawIcon }; case ORDER_STATUS.CANCELED_CLIENT: return { textKey: 'orderStatus.canceled_client', className: style.statusError, Icon: CloseIcon }; case ORDER_STATUS.CANCELED_WORKER: return { textKey: 'orderStatus.canceled_worker', className: style.statusError, Icon: CloseIcon }; case ORDER_STATUS.CANCELED_ADMIN: return { textKey: 'orderStatus.canceled_admin', className: style.statusError, Icon: CloseIcon }; case ORDER_STATUS.DISPUTED: return { textKey: 'orderStatus.disputed', className: style.statusError, Icon: AlertIcon }; case ORDER_STATUS.PENDING_PLATFORM_PAYMENT: return { textKey: 'orderStatus.awaitingPayment', className: style.statusWarning, Icon: CardIcon }; case ORDER_STATUS.PENDING_PLATFORM_FEE: return { textKey: 'orderStatus.awaitingBookingFee', className: style.statusWarning, Icon: CardIcon }; case ORDER_STATUS.RECURRING_PAYMENT_FAILED: return { textKey: 'orderStatus.paymentFailed', className: style.statusError, Icon: AlertIcon }; default: return { textKey: 'orderStatus.unknown', className: style.statusDefault, Icon: HourglassIcon }; } };

const getServiceTypeInfo = (serviceType?: string) => {
    switch (serviceType) {
        case SERVICE_TYPE.BOARDING: return { textKey: 'orderTypes.boarding', Icon: BoardingIcon };
        case SERVICE_TYPE.HOUSE_SITTING: return { textKey: 'orderTypes.houseSitting', Icon: HouseSittingIcon };
        case SERVICE_TYPE.DROP_IN_VISIT: return { textKey: 'orderTypes.dropInVisit', Icon: DropInVisitsIcon };
        case SERVICE_TYPE.DOGGY_DAY_CARE: return { textKey: 'orderTypes.doggyDayCare', Icon: DoggyDayCareIcon };
        case SERVICE_TYPE.WALKING: return { textKey: 'orderTypes.walking', Icon: DogWalkingIcon };
        default: return { textKey: 'orderTypes.unknown', Icon: PawIcon };
    }
};

interface OrderItemCardProps {
    order: any;
    onPay: (order: any) => void;
    onDetails: (orderId: string) => void;
    onReview: (order: any) => void;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ order: item, onPay, onDetails, onReview }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [timeLeftString, setTimeLeftString] = useState<string | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => { moment.locale(i18n.language); }, [i18n.language]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!item.payment_due_at_utc || ![ORDER_STATUS.PENDING_PLATFORM_PAYMENT, ORDER_STATUS.PENDING_PLATFORM_FEE].includes(item.status)) {
                setTimeLeftString(null);
                setIsExpired(false);
                return;
            }
            const dueTime = moment.utc(item.payment_due_at_utc).local();
            const now = moment();
            const diff = dueTime.diff(now);

            if (diff <= 0) {
                setTimeLeftString(null);
                setIsExpired(true);
            } else {
                const duration = moment.duration(diff);
                const hours = Math.floor(duration.asHours());
                const minutes = duration.minutes();
                let timeStr = '';
                if (hours > 0) timeStr += `${hours}ч `;
                timeStr += `${minutes}мин`;
                setTimeLeftString(timeStr.trim());
                setIsExpired(false);
            }
        };
        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(interval);
    }, [item.payment_due_at_utc, item.status]);

    const statusInfo = getStatusInfo(item.status);
    const typeInfo = getServiceTypeInfo(item.service_type);
    const workerData = item.worker?.data;
    const workerName = workerData?.name || workerData?.first_name || null;
    const pendingOffersCount = item.requests_pending_count || 0;
    const isRecurring = item.schedule_type === 'recurring';
    const billingPeriods = item.billing_periods?.data || [];
    const unpaidPeriod = billingPeriods.find((bp: any) => bp.status === BILLING_PERIOD_STATUS.PENDING_PAYMENT || bp.status === BILLING_PERIOD_STATUS.PAYMENT_FAILED);

    const isAwaitingPaymentStatus = useMemo(() => {
        if ([ORDER_STATUS.PENDING_PLATFORM_PAYMENT, ORDER_STATUS.PENDING_PLATFORM_FEE, ORDER_STATUS.RECURRING_PAYMENT_FAILED].includes(item.status)) return true;
        if (isRecurring && unpaidPeriod && [ORDER_STATUS.CONFIRMED, ORDER_STATUS.IN_PROGRESS].includes(item.status)) {
            return parseFloat(String(unpaidPeriod.amount_due_from_client || '0')) > 0.001;
        }
        return false;
    }, [item.status, unpaidPeriod, isRecurring]);

    const scheduleDisplay = useMemo(() => {
        const startDate = item.start_date_local ? formatDate(item.start_date_local) : '';
        const endDate = item.end_date_local ? formatDate(item.end_date_local) : '';
        if (!startDate) return t('common.notSpecified');
        return isRecurring ? `${t('orders.recurringFrom', { date: startDate })} ` : (endDate && endDate !== startDate ? `${startDate} - ${endDate} ` : startDate);
    }, [isRecurring, item.start_date_local, item.end_date_local, i18n.language]);

    const paymentDisplayInfo = useMemo(() => {
        let { payment_flow_type } = item;
        if (!payment_flow_type) { payment_flow_type = item.status === ORDER_STATUS.PENDING_PLATFORM_FEE ? PAYMENT_FLOW.PLATFORM_FEE_ONLY : PAYMENT_FLOW.PLATFORM_PREPAY; }
        const { currency, start_date_local } = item;
        const infoLines: any[] = [];
        let paymentDueToPlatformNowNum = 0;
        let amountDueToWorkerDirectlyLaterNum = 0;
        let paymentButtonTextKey = 'orders.payButtonAmount';

        if (payment_flow_type === PAYMENT_FLOW.PLATFORM_FEE_ONLY) {
            paymentButtonTextKey = 'orders.payBookingFeeButtonAmount';
            if (unpaidPeriod) {
                paymentDueToPlatformNowNum = parseFloat(unpaidPeriod.amount_due_from_client?.toString() || '0');
                amountDueToWorkerDirectlyLaterNum = parseFloat(unpaidPeriod.amount_payable_directly_to_worker?.toString() || '0');
            } else if (billingPeriods[0]) {
                paymentDueToPlatformNowNum = parseFloat(billingPeriods[0].amount_due_from_client?.toString() || '0');
                amountDueToWorkerDirectlyLaterNum = parseFloat(billingPeriods[0].amount_payable_directly_to_worker?.toString() || '0');
            }
        } else if (payment_flow_type === PAYMENT_FLOW.PLATFORM_PREPAY) {
            if (unpaidPeriod) paymentDueToPlatformNowNum = parseFloat(unpaidPeriod.amount_due_from_client?.toString() || '0');
            else if (billingPeriods[0]) paymentDueToPlatformNowNum = parseFloat(billingPeriods[0].amount_due_from_client?.toString() || '0');
        }
        paymentDueToPlatformNowNum = Math.max(0, paymentDueToPlatformNowNum);
        const startDateFormatted = start_date_local ? formatFullDate(start_date_local) : t('common.serviceStartDate');

        if (isAwaitingPaymentStatus) {
            if (paymentDueToPlatformNowNum > 0.009) {
                const labelKey = payment_flow_type === PAYMENT_FLOW.PLATFORM_FEE_ONLY ? 'orders.bookingFeeDueNow' : 'orders.paymentDueFull';
                const isDebt = [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.CONFIRMED, ORDER_STATUS.RECURRING_PAYMENT_FAILED].includes(item.status);
                infoLines.push({ type: 'paymentDuePlatform', labelKey: isDebt ? 'orders.paymentOverdue' : labelKey, amount: formatPrice(paymentDueToPlatformNowNum, currency), icon: CardIcon, important: true });
            }
            if (amountDueToWorkerDirectlyLaterNum > 0.009) {
                infoLines.push({ type: 'paymentDueWorker', labelKey: 'orders.remainingDueWorkerDirectly', amount: formatPrice(amountDueToWorkerDirectlyLaterNum, currency), infoKey: 'orders.payWorkerOnDateInfo', date: startDateFormatted, icon: WalletIcon, important: false });
            }
        }
        return { infoLines: infoLines.filter(l => l.labelKey || l.textKey), paymentButtonTextKey, paymentButtonAmountForDisplay: paymentDueToPlatformNowNum };
    }, [item, isAwaitingPaymentStatus, unpaidPeriod, billingPeriods, i18n.language]);

    // --- Smart Banners ---
    const renderSmartBanner = () => {
        if (item.status !== ORDER_STATUS.PENDING_WORKER) return null;
        const requests = item.requests?.data || [];
        const workerOffers = requests.filter((r: any) => r.request_type === REQUEST_TYPE.WORKER_OFFER && r.status === REQUEST_STATUS.PENDING);
        const myInvites = requests.filter((r: any) => r.request_type === REQUEST_TYPE.CLIENT_INVITE && r.status === REQUEST_STATUS.PENDING);
        const readyToConfirmAdmin = requests.filter((r: any) => r.request_type === REQUEST_TYPE.ADMIN_SUGGESTION && r.status === REQUEST_STATUS.AWAITING_CLIENT);
        const readyToConfirmInvite = requests.filter((r: any) => r.request_type === REQUEST_TYPE.CLIENT_INVITE && r.status === REQUEST_STATUS.AWAITING_CLIENT);

        const goToResponses = () => navigate(`/cabinet/orders/${item.id}/responses`);

        if (readyToConfirmAdmin.length > 0) return (<div className={`${style.smartBanner} ${style.bannerPurple}`} onClick={goToResponses}><div className={`${style.bannerIcon} ${style.purple}`}><CheckIcon /></div><div className={style.bannerContent}><span className={style.bannerTitle}>{t('orders.banner.adminSuggestionTitle', 'Рекомендация сервиса')}</span><span className={style.bannerText}>{t('orders.banner.adminSuggestionBodyDetailed', 'Мы подобрали отличного ситтера.')}</span></div><ChevronRight /></div>);
        if (readyToConfirmInvite.length > 0) { const workerName = readyToConfirmInvite[0].recipient?.data?.first_name || 'Ситтер'; return (<div className={`${style.smartBanner} ${style.bannerGreen}`} onClick={goToResponses}><div className={`${style.bannerIcon} ${style.green}`}><CheckIcon /></div><div className={style.bannerContent}><span className={style.bannerTitle}>{t('orders.banner.workerAcceptedTitle', 'Ура! Есть согласие.')}</span><span className={style.bannerText}>{t('orders.banner.workerAcceptedChoiceBody', { name: workerName, defaultValue: `${workerName} готов выполнить заказ.` })}</span></div><ChevronRight /></div>); }
        if (workerOffers.length >= 3) return (<div className={`${style.smartBanner} ${style.bannerOrange}`} onClick={goToResponses}><div className={`${style.bannerIcon} ${style.orange}`}><StarIcon /></div><div className={style.bannerContent}><span className={style.bannerTitle}>{t('orders.banner.popularTitle', 'Ваш заказ популярен!')}</span><span className={style.bannerText}>{t('orders.banner.popularBodyDetailed', { count: workerOffers.length, defaultValue: `Уже ${workerOffers.length} ситтеров хотят помочь.` })}</span></div><ChevronRight /></div>);
        if (workerOffers.length > 0) { const count = workerOffers.length; const textKey = count === 1 ? 'orders.banner.singleOfferBody' : 'orders.banner.fewOffersBody'; const defaultText = count === 1 ? 'Появился первый отклик!' : `У вас уже ${count} отклика.`; return (<div className={`${style.smartBanner} ${style.bannerBlue}`} onClick={goToResponses}><div className={`${style.bannerIcon} ${style.blue}`}><CardIcon /></div><div className={style.bannerContent}><span className={style.bannerTitle}>{t('orders.banner.newOffersTitle', 'Новые предложения')}</span><span className={style.bannerText}>{t(textKey, { count, defaultValue: defaultText })}</span></div><ChevronRight /></div>); }
        if (myInvites.length > 0) { const count = myInvites.length; const workerName = myInvites[0].recipient?.data?.first_name || 'Ситтер'; const textKey = count === 1 ? 'orders.banner.waitingSingleBody' : 'orders.banner.waitingMultipleBody'; const defaultText = count === 1 ? `Ждем ответа от ${workerName}.` : `Вы пригласили нескольких исполнителей.`; return (<div className={`${style.smartBanner} ${style.bannerGrey}`}><div className={`${style.bannerIcon} ${style.grey}`}><HourglassIcon /></div><div className={style.bannerContent}><span className={style.bannerTitle}>{t('orders.banner.waitingTitle', 'В ожидании ответа')}</span><span className={style.bannerText}>{t(textKey, { name: workerName, defaultValue: defaultText })}</span></div></div>); }
        return (<div className={`${style.smartBanner} ${style.bannerGrey}`}><div className={`${style.bannerIcon} ${style.grey}`}><HourglassIcon /></div><div className={style.bannerContent}><span className={style.bannerTitle}>{t('orders.banner.searchingTitle', 'Ищем исполнителей...')}</span><span className={style.bannerText}>{t('orders.banner.searchingBodyDetailed', 'Мы оповестили ситтеров.')}</span></div></div>);
    };

    const renderActionButtons = () => {
        const paymentDue = (paymentDisplayInfo?.paymentButtonAmountForDisplay ?? 0) > 0.001;
        const offersAvailable = pendingOffersCount > 0;

        // Если заказ новый (Pending Worker)
        if (item.status === ORDER_STATUS.PENDING_WORKER) {
            if (offersAvailable) {
                return (
                    <button className={`${style.actionButton} ${style.btnPrimary}`} onClick={() => navigate(`/cabinet/orders/${item.id}/responses`)}>
                        <ListIcon /> {t('orders.viewAndSelectOfferButtonCount', { count: pendingOffersCount })}
                    </button>
                );
            } else {
                return (
                    <button className={`${style.actionButton} ${style.btnSecondary}`} onClick={() => onDetails(item.id)}>
                        {t('orders.viewDetailsButton', 'Подробнее')}
                    </button>
                );
            }
        }

        // Если ожидается оплата (Pending Payment)
        if (isAwaitingPaymentStatus && paymentDue) {
            const formattedPaymentAmount = formatPrice(paymentDisplayInfo!.paymentButtonAmountForDisplay, item.currency);
            return (
                <button className={`${style.actionButton} ${style.btnPay}`} onClick={() => onPay(item)}>
                    <CardIcon /> {t(paymentDisplayInfo!.paymentButtonTextKey, { amount: formattedPaymentAmount })}
                </button>
            );
        }

        if (item.status === ORDER_STATUS.COMPLETED) {
            const { is_review_window_expired, has_viewer_reviewed } = item.review_info || {};
            if (!has_viewer_reviewed && !is_review_window_expired) {
                return (
                    <button className={`${style.actionButton} ${style.btnReview}`} onClick={() => onReview(item)}>
                        <StarIcon /> {t('orders.leaveReviewButton')}
                    </button>
                );
            }
        }
        return (
            <button className={`${style.actionButton} ${style.btnSecondary}`} onClick={() => onDetails(item.id)}>
                {t('orders.viewDetailsButton', 'Подробнее')}
            </button>
        );
    };

    return (
        <div className={style.orderCard} onClick={() => onDetails(item.id)}>
            <div className={style.cardHeader}>
                <div className={`${style.statusBadge} ${statusInfo.className}`}>
                    {t(statusInfo.textKey)}
                </div>
            </div>

            <div className={style.cardBody}>
                <div className={style.headerRow}>
                    <div className={style.serviceIconCircle}>
                        <typeInfo.Icon width={28} height={28} />
                    </div>
                    <div className={style.titleContainer}>
                        <span className={style.orderTitle}>{t(typeInfo.textKey)}</span>
                        <span className={style.durationText}>{scheduleDisplay}</span>
                    </div>
                </div>

                {timeLeftString && (
                    <div className={`${style.paymentDueBanner} ${isExpired ? style.expired : ''}`}>
                        <div className={style.paymentDueIcon}><AlertIcon /></div>
                        <div>
                            <span className={style.paymentDueTitle}>{t('orders.paymentRequiredTitle', 'Оплата для подтверждения')}</span>
                            <span className={style.paymentDueText}>
                                {isExpired ? t('orders.orderAutoCancelled', 'Заказ будет отменен.') : <>Заказ будет отменен через: <strong>{timeLeftString}</strong></>}
                            </span>
                        </div>
                    </div>
                )}

                <div className={style.orderInfoSection}>
                    <div className={`${style.infoBlock} ${style.withBorder}`} style={{ padding: '12px 16px' }}>
                        {renderSmartBanner()}
                        {workerName && (
                            <div className={style.orderInfoRow}>
                                <PersonIcon className={style.infoIcon} />
                                <span className={style.orderInfoText}>
                                    {t('orders.assignedWorker')}:{' '}
                                    <span
                                        className={style.workerName}
                                        style={workerData?.id ? { cursor: 'pointer', color: '#3598FE', textDecoration: 'underline' } : {}}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (workerData?.id) window.open(`/sitter/${workerData.id}`, '_blank')
                                        }}
                                    >
                                        {workerName}
                                    </span>
                                </span>
                            </div>
                        )}
                        {!workerName && item.status !== ORDER_STATUS.PENDING_WORKER && (
                            <div className={style.orderInfoRow}>
                                <PersonIcon className={style.infoIcon} />
                                <span className={style.orderInfoText}>
                                    {t('orders.assignedWorker')}: <span className={style.workerName} style={{ color: '#718096' }}>{t('common.notAssigned', 'Не назначен')}</span>
                                </span>
                            </div>
                        )}
                    </div>
                    {paymentDisplayInfo && paymentDisplayInfo.infoLines.length > 0 && (
                        <div className={style.infoBlock} style={{ padding: '12px 16px' }}>
                            {paymentDisplayInfo.infoLines.map((info: any, index: number) => (
                                <div key={index} className={`${style.orderInfoRow} ${info.important ? style.important : ''}`}>
                                    <div className={style.infoIcon}><info.icon /></div>
                                    <div className={style.paymentTextContainer}>
                                        <span className={`${style.paymentLabel} ${info.important ? style.important : ''}`}>
                                            {info.labelKey ? t(info.labelKey) : (info.textKey ? t(info.textKey, { date: info.date, amount: info.amount }) : '')}
                                            {info.labelKey && info.amount && <span className={`${style.paymentAmount} ${info.important ? style.important : ''}`}>: {info.amount}</span>}
                                        </span>
                                        {info.infoKey && <div className={style.paymentSubText}>{t(info.infoKey, { date: info.date })}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={style.cardFooter} onClick={e => e.stopPropagation()}>
                {renderActionButtons()}
            </div>
        </div>
    );
};

export default OrderItemCard;