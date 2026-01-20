// --- File: src/components/orders/OrderItemCard.tsx ---
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import style from '../../style/pages/cabinet/CabinetOrders.module.scss';
import { useNavigate } from 'react-router-dom'; // Импорт для навигации

// Иконки
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CardIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const AlertIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
// Иконка для списка откликов
const ListIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;

const ORDER_STATUS = {
    PENDING_WORKER: 'pending_worker',
    PENDING_PLATFORM_PAYMENT: 'pending_platform_payment',
    PENDING_PLATFORM_FEE: 'pending_platform_fee',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELED_CLIENT: 'canceled_client',
    CANCELED_WORKER: 'canceled_worker',
    CANCELED_ADMIN: 'canceled_admin',
    RECURRING_PAYMENT_FAILED: 'recurring_payment_failed',
};

const BILLING_PERIOD_STATUS = {
    PENDING_PAYMENT: 'pending_payment',
    PAYMENT_FAILED: 'payment_failed'
};

interface OrderItemCardProps {
    order: any;
    onPay: () => void;
    onDetails: () => void;
    onReview?: () => void;
    disabled?: boolean;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ order, onPay, onDetails, disabled }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate(); // Используем хук для навигации
    const [timeLeftString, setTimeLeftString] = useState<string | null>(null);

    useEffect(() => {
        moment.locale(i18n.language);
    }, [i18n.language]);

    // Логика таймера (без изменений)
    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!order.payment_due_at_utc || ![ORDER_STATUS.PENDING_PLATFORM_PAYMENT, ORDER_STATUS.PENDING_PLATFORM_FEE].includes(order.status)) {
                setTimeLeftString(null);
                return;
            }
            const dueTime = moment.utc(order.payment_due_at_utc).local();
            const now = moment();
            const diff = dueTime.diff(now);

            if (diff <= 0) {
                setTimeLeftString(null);
            } else {
                const duration = moment.duration(diff);
                const hours = Math.floor(duration.asHours());
                const minutes = duration.minutes();
                setTimeLeftString(`${hours}ч ${minutes}мин`);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(interval);
    }, [order]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case ORDER_STATUS.PENDING_WORKER: return { label: t('orderStatus.new', 'Поиск исполнителя'), className: style.statusWarning };
            case ORDER_STATUS.PENDING_PLATFORM_PAYMENT:
            case ORDER_STATUS.PENDING_PLATFORM_FEE: return { label: t('orderStatus.awaitingPrepayment', 'Ожидает оплаты'), className: style.statusWarning };
            case ORDER_STATUS.CONFIRMED: return { label: t('orderStatus.confirmed', 'Подтвержден'), className: style.statusSuccess };
            case ORDER_STATUS.IN_PROGRESS: return { label: t('orderStatus.inProgress', 'В процессе'), className: style.statusInfo };
            case ORDER_STATUS.COMPLETED: return { label: t('orderStatus.completed', 'Завершен'), className: style.statusSuccess };
            case ORDER_STATUS.CANCELED_CLIENT:
            case ORDER_STATUS.CANCELED_WORKER:
            case ORDER_STATUS.CANCELED_ADMIN: return { label: t('orderStatus.canceled', 'Отменен'), className: style.statusError };
            case ORDER_STATUS.RECURRING_PAYMENT_FAILED: return { label: t('orderStatus.paymentFailed', 'Ошибка оплаты'), className: style.statusError };
            default: return { label: status, className: style.statusDefault };
        }
    };

    const statusConfig = getStatusConfig(order.status);
    const worker = order.worker?.data;
    const serviceName = t(`header.services.${order.service_type}`, order.service_type);

    const billingPeriods = order.billing_periods?.data || [];
    const unpaidPeriod = billingPeriods.find((bp: any) => bp.status === BILLING_PERIOD_STATUS.PENDING_PAYMENT || bp.status === BILLING_PERIOD_STATUS.PAYMENT_FAILED);
    const isPaymentDue = !!unpaidPeriod || [ORDER_STATUS.PENDING_PLATFORM_PAYMENT, ORDER_STATUS.PENDING_PLATFORM_FEE, ORDER_STATUS.RECURRING_PAYMENT_FAILED].includes(order.status);

    const priceDisplay = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: order.currency || 'RUB', maximumFractionDigits: 0 }).format(order.agreed_price || 0);

    const pendingOffersCount = order.requests_pending_count || 0;

    // Обработчик кнопки "Отклики"
    const handleViewResponses = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) {
            navigate(`/cabinet/orders/${order.id}/responses`);
        }
    };

    return (
        <div className={style.orderCard} onClick={!disabled ? onDetails : undefined}>
            <div className={style.cardHeader}>
                <div className={style.serviceInfo}>
                    <span className={style.serviceType}>{serviceName as React.ReactNode}</span>
                    <span className={`${style.statusBadge} ${statusConfig.className}`}>{statusConfig.label}</span>
                </div>
                {/* Цену убираем, если это не финал. Но если исполнитель найден - показываем */}
                {/* {order.status !== ORDER_STATUS.PENDING_WORKER && (
                    <div className={style.price}>{priceDisplay}</div>
                )} */}
            </div>

            <div className={style.cardBody}>
                <div className={style.infoRow}>
                    <CalendarIcon />
                    <span>
                        {moment(order.start_date_local).format('D MMM')}
                        {order.end_date_local && order.end_date_local !== order.start_date_local ? ` - ${moment(order.end_date_local).format('D MMM')}` : ''}
                    </span>
                </div>

                {worker && (
                    <div className={style.infoRow}>
                        <UserIcon />
                        <span>{worker.first_name} {worker.last_name}</span>
                    </div>
                )}

                {timeLeftString && (
                    <div className={style.timerAlert}>
                        <AlertIcon />
                        <span>{t('orders.paymentTimer', 'Оплатите в течение')}: <strong>{timeLeftString}</strong></span>
                    </div>
                )}
            </div>

            <div className={style.cardFooter}>
                <div className={style.actionsWrapper}>
                    {/* КНОПКА ОТКЛИКОВ ДЛЯ PENDING_WORKER */}
                    {order.status === ORDER_STATUS.PENDING_WORKER && (
                        <button
                            className={style.offersBtn}
                            onClick={handleViewResponses}
                            disabled={disabled}
                            // Стили для синей кнопки
                            style={{ backgroundColor: '#3182CE', color: '#fff' }}
                        >
                            <ListIcon />
                            {pendingOffersCount > 0
                                ? t('orders.viewAndSelectOfferButtonCount', { count: pendingOffersCount, defaultValue: `Отклики (${pendingOffersCount})` })
                                : t('orders.responsesAndInvitesTitle', 'Отклики и приглашения')
                            }
                        </button>
                    )}

                    {isPaymentDue ? (
                        <button className={style.payBtn} onClick={(e) => { e.stopPropagation(); if (!disabled) onPay(); }} disabled={disabled}>
                            <CardIcon /> {t('orders.payButton', 'Оплатить')}
                        </button>
                    ) : (
                        // Если статус не PENDING_WORKER (или если мы хотим кнопку Подробнее рядом с кнопкой Отклики)
                        // В мобилке в PENDING_WORKER только кнопка откликов.
                        // Если статус другой - кнопка Подробнее
                        order.status !== ORDER_STATUS.PENDING_WORKER && (
                            <button className={style.detailsBtn} onClick={(e) => { e.stopPropagation(); if (!disabled) onDetails(); }} disabled={disabled}>
                                {t('orders.viewDetails', 'Подробнее')}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderItemCard;