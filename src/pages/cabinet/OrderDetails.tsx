import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/ru';
import style from '../../style/pages/cabinet/OrderDetails.module.scss';
import { getOrderDetails, cancelOrder, clientInitiateChatWithWorker } from '../../services/api';
import PaymentModal from '../../components/modals/PaymentModal';

// Иконки SVG
const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const ChatIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const WalletIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const StarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const HourglassIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2v20h16V2H4zm8 9l-4 4h8l-4-4zm0-9l4 4H8l4-4z" /></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PawIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>;
const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const AlertIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const CardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const LocationIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const PhoneIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;

const BILLING_PERIOD_STATUS = {
    PENDING_PAYMENT: 'pending_payment',
    PAID: 'paid',
    PAYMENT_FAILED: 'payment_failed',
    TASKS_COMPLETED: 'tasks_completed',
    PAYOUT_PENDING: 'payout_pending',
    PAYOUT_COMPLETED: 'payout_complete'
};

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
    DISPUTED: 'disputed',
    RECURRING_PAYMENT_FAILED: 'recurring_payment_failed'
};

const SERVICE_TYPE = {
    BOARDING: 'boarding',
    HOUSE_SITTING: 'house_sitting',
    DROP_IN_VISIT: 'drop_in_visit',
    DOGGY_DAY_CARE: 'doggy_day_care',
    WALKING: 'walking',
};

const getStatusInfo = (status?: string) => { switch (status) { case ORDER_STATUS.PENDING_WORKER: return { textKey: 'orderStatus.new', color: '#DD6B20', Icon: HourglassIcon, bg: '#FFFAF0' }; case ORDER_STATUS.PENDING_PLATFORM_PAYMENT: case ORDER_STATUS.PENDING_PLATFORM_FEE: return { textKey: 'orderStatus.awaitingPayment', color: '#DD6B20', Icon: CardIcon, bg: '#FFFAF0' }; case ORDER_STATUS.CONFIRMED: return { textKey: 'orderStatus.confirmed', color: '#38A169', Icon: CheckIcon, bg: '#F0FFF4' }; case ORDER_STATUS.IN_PROGRESS: return { textKey: 'orderStatus.inProgress', color: '#3182CE', Icon: PlayIcon, bg: '#EBF8FF' }; case ORDER_STATUS.COMPLETED: return { textKey: 'orderStatus.completed', color: '#38A169', Icon: PawIcon, bg: '#F0FFF4' }; case ORDER_STATUS.CANCELED_CLIENT: return { textKey: 'orderStatus.canceled_client', color: '#E53E3E', Icon: CloseIcon, bg: '#FFF5F5' }; case ORDER_STATUS.CANCELED_WORKER: return { textKey: 'orderStatus.canceled_worker', color: '#E53E3E', Icon: CloseIcon, bg: '#FFF5F5' }; case ORDER_STATUS.CANCELED_ADMIN: return { textKey: 'orderStatus.canceled_admin', color: '#E53E3E', Icon: CloseIcon, bg: '#FFF5F5' }; case ORDER_STATUS.DISPUTED: return { textKey: 'orderStatus.disputed', color: '#E53E3E', Icon: AlertIcon, bg: '#FFF5F5' }; case ORDER_STATUS.RECURRING_PAYMENT_FAILED: return { textKey: 'orderStatus.paymentFailed', color: '#E53E3E', Icon: AlertIcon, bg: '#FFF5F5' }; default: return { textKey: 'orderStatus.unknown', color: '#718096', Icon: HourglassIcon, bg: '#F7FAFC' }; } };

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const includes = 'worker.avatar,tasks,billing_periods.payment,billing_periods.payout,reviews,canceledBy';
            const res = await getOrderDetails(id!, includes);
            setOrder(res.data || res);
        } catch (e) {
            console.error("Failed to fetch order", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const handleChat = async () => {
        if (!order?.worker?.data?.id) return;
        try {
            const chat = await clientInitiateChatWithWorker(order.id, order.worker.data.id);
            if (chat?.id) {
                navigate(`/cabinet/chat/${chat.id}`);
            } else {
                navigate(`/cabinet/chat`);
            }
        } catch (e) {
            alert('Не удалось открыть чат');
        }
    };

    const handleCancel = async () => {
        if (window.confirm(t('orders.cancelConfirmMessage', 'Вы уверены, что хотите отменить заказ?') as string)) {
            try {
                await cancelOrder(order.id, { reason: 'Client cancelled via web' });
                fetchOrder();
            } catch (e) {
                alert('Ошибка отмены');
            }
        }
    };

    const totalToPayDirectly = useMemo(() => {
        if (!order?.billing_periods?.data) return 0;
        return order.billing_periods.data.reduce((acc: number, period: any) => {
            const val = parseFloat(String(period.amount_payable_directly_to_worker || period.amount_payable_directly || '0'));
            return acc + (isNaN(val) ? 0 : val);
        }, 0);
    }, [order]);

    if (loading) return <div className={style.loaderContainer}><div className={style.spinner}></div></div>;
    if (!order) return <div className={style.errorContainer}>{t('orders.orderNotFound', 'Заказ не найден')}</div>;

    const worker = order.worker?.data;
    const billingPeriods = order.billing_periods?.data || [];
    const statusInfo = getStatusInfo(order.status);

    // Logic for "Pay Now" button
    const unpaidPeriod = billingPeriods.find((bp: any) => bp.status === BILLING_PERIOD_STATUS.PENDING_PAYMENT || bp.status === BILLING_PERIOD_STATUS.PAYMENT_FAILED);
    const amountToPay = unpaidPeriod ? unpaidPeriod.amount_due_from_client : 0;
    const needsPayment = parseFloat(amountToPay) > 0;

    const showCancelOrder = [ORDER_STATUS.PENDING_WORKER, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PENDING_PLATFORM_PAYMENT, ORDER_STATUS.PENDING_PLATFORM_FEE].includes(order.status);
    const showWorkerAddress = worker && [SERVICE_TYPE.BOARDING, SERVICE_TYPE.DOGGY_DAY_CARE].includes(order.service_type) && [ORDER_STATUS.CONFIRMED, ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.COMPLETED].includes(order.status);

    return (
        <div className={style.container}>
            <div className={style.header}>
                <button className={style.backBtn} onClick={() => navigate('/cabinet/orders')}>
                    <BackIcon /> <span>{t('common.back', 'Назад') as string}</span>
                </button>
                {/* Status Banner */}
                <div className={style.statusBanner} style={{ backgroundColor: statusInfo.bg }}>
                    <div style={{ color: statusInfo.color, marginRight: 10, display: 'flex' }}><statusInfo.Icon /></div>
                    <span style={{ color: statusInfo.color, fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {t(statusInfo.textKey)}
                    </span>
                </div>
            </div>

            <div className={style.contentGrid}>
                <div className={style.mainColumn}>
                    {/* Direct Payment Alert */}
                    {totalToPayDirectly > 0 && (
                        <div className={style.warningBox}>
                            <div className={style.warningIcon}><WalletIcon /></div>
                            <div className={style.warningContent}>
                                <h4>{t('orders.paymentRequiredTitle', 'Оплата исполнителю') as string}</h4>
                                <div className={style.warningAmount}>{totalToPayDirectly} {order.currency}</div>
                                <p>Пожалуйста, оплатите эту часть суммы исполнителю напрямую (наличными или переводом) перед началом заказа.</p>
                            </div>
                        </div>
                    )}

                    {/* Worker Details */}
                    <div className={style.card}>
                        <h3 className={style.cardTitle}>Исполнитель</h3>
                        {worker ? (
                            <div className={style.workerContent}>
                                <div className={style.workerRow}>
                                    <img
                                        src={worker.avatar?.data?.preview_url || '/placeholder-user.jpg'}
                                        alt={worker.first_name}
                                        className={style.avatar}
                                    />
                                    <div className={style.workerInfo}>
                                        <h4 className={style.workerName}>{worker.first_name} {worker.last_name}</h4>
                                        <div className={style.rating}>
                                            <StarIcon />
                                            <span>{worker.calculated_rating || '5.0'}</span>
                                            <span className={style.reviewsCount}>({worker.reviews_count || 0})</span>
                                        </div>
                                        <Link to={`/sitter/${worker.id}`} className={style.profileLinkText}>
                                            Открыть профиль
                                        </Link>
                                    </div>
                                    <div className={style.workerActions}>
                                        <button className={style.iconActionBtn} onClick={handleChat}>
                                            <ChatIcon />
                                        </button>
                                        {worker.phone && (
                                            <a href={`tel:${worker.phone}`} className={`${style.iconActionBtn} ${style.phoneBtn}`}>
                                                <PhoneIcon />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {showWorkerAddress && worker.address && (
                                    <div className={style.detailRow} style={{ marginTop: 15, borderTop: '1px solid #EDF2F7', paddingTop: 10 }}>
                                        <div className={style.detailLabel}><LocationIcon /> Адрес:</div>
                                        <div className={style.detailValue}>{worker.address}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // --- ИСПРАВЛЕНИЕ: Добавлен стиль noWorkerState ---
                            <div className={style.noWorkerState}>
                                <p>Исполнитель еще не назначен</p>
                            </div>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className={style.card}>
                        <h3 className={style.cardTitle}>{t('orders.orderDetails', 'Детали заказа') as string}</h3>
                        <div className={style.detailsList}>
                            <div className={style.detailRow}>
                                <div className={style.detailLabel}>
                                    <CalendarIcon /> {t('common.dates', 'Даты') as string}:
                                </div>
                                <div className={style.detailValue}>
                                    {moment(order.start_date_local).format('D MMM')} - {moment(order.end_date_local).format('D MMM YYYY')}
                                </div>
                            </div>
                            <div className={style.detailRow}>
                                <div className={style.detailLabel}>
                                    <WalletIcon /> {t('orders.pricePerUnit', 'Стоимость услуги') as string}:
                                </div>
                                <div className={style.detailValue}>
                                    {order.price_per_rate} {order.currency}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tasks (Schedule) */}
                    {order.tasks?.data?.length > 0 && (
                        <div className={style.card}>
                            <h3 className={style.cardTitle}>{t('orders.visitsSchedule', 'Расписание')}</h3>
                            <ul className={style.tasksList}>
                                {order.tasks.data.slice(0, 5).map((task: any) => (
                                    <li key={task.id} className={style.taskItem}>
                                        <div className={style.taskDate}>
                                            <span className={style.day}>{moment(task.scheduled_start_at_local).format('DD')}</span>
                                            <span className={style.month}>{moment(task.scheduled_start_at_local).format('MMM')}</span>
                                        </div>
                                        <div className={style.taskInfo}>
                                            <span className={style.taskTime}>{moment(task.scheduled_start_at_local).format('HH:mm')}</span>
                                            <span className={style.taskService}>{t(`header.services.${task.service_type}`, task.service_type) as string}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Financial Details */}
                    <div className={style.card}>
                        <h3 className={style.cardTitle}>{t('orders.financialDetails', 'Финансы') as string}</h3>
                        {/* --- ИСПРАВЛЕНИЕ: Добавлен стиль emptyText --- */}
                        {billingPeriods.length === 0 && <p className={style.emptyText}>Информация о периодах оплаты отсутствует</p>}

                        {billingPeriods.map((period: any) => {
                            // Logic matched from RN ClientBillingPeriodItem
                            const grossAmount = parseFloat(period.gross_amount || '0');
                            const discountAmount = parseFloat(period.discount_amount || '0');
                            const onlinePayment = parseFloat(period.amount_due_from_client || '0');
                            const directPayment = parseFloat(period.amount_payable_directly_to_worker || period.amount_payable_directly || '0');
                            const totalClientCost = grossAmount - discountAmount;

                            let statusText = 'В обработке';
                            let statusClass = style.statusWarning;

                            if ([BILLING_PERIOD_STATUS.PAID, BILLING_PERIOD_STATUS.TASKS_COMPLETED, BILLING_PERIOD_STATUS.PAYOUT_COMPLETED, BILLING_PERIOD_STATUS.PAYOUT_PENDING].includes(period.status)) {
                                statusText = 'Оплачено';
                                statusClass = style.statusSuccess;
                            } else if (period.status === BILLING_PERIOD_STATUS.PENDING_PAYMENT) {
                                statusText = 'Ожидает оплаты';
                                statusClass = style.statusWarning;
                            } else if (period.status === BILLING_PERIOD_STATUS.PAYMENT_FAILED) {
                                statusText = 'Ошибка оплаты';
                                statusClass = style.statusError;
                            }

                            return (
                                <div key={period.id} className={style.billingCard}>
                                    <div className={style.billingHeader}>
                                        <div>
                                            <div className={style.billingDateLabel}>{t('common.period', 'Период')}</div>
                                            <div className={style.billingDateValue}>{moment(period.period_start).format('D MMM')} - {moment(period.period_end).format('D MMM')}</div>
                                        </div>
                                        <div className={`${style.statusBadgeSmall} ${statusClass}`}>
                                            {statusText}
                                        </div>
                                    </div>
                                    <div className={style.divider} />
                                    <div className={style.financeSection}>
                                        <div className={style.financeRow}>
                                            <span className={style.financeLabel}>{t('orders.grossAmount', 'Стоимость услуг')}</span>
                                            <span className={style.financeValue}>{grossAmount.toFixed(2)} {order.currency}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className={style.financeRow}>
                                                <span className={style.financeLabel}>{t('orders.discount', 'Скидка')}</span>
                                                <span className={`${style.financeValue} ${style.successText}`}>- {discountAmount.toFixed(2)} {order.currency}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={style.dividerDashed} />
                                    <div className={style.totalsSection}>
                                        <div className={style.totalRow}>
                                            <span className={style.totalLabel}>{t('orders.totalCost', 'Итого к оплате')}</span>
                                            <span className={style.totalValue}>{totalClientCost.toFixed(2)} {order.currency}</span>
                                        </div>
                                        <div className={style.paymentMethodBox}>
                                            {onlinePayment > 0 && (
                                                <div className={style.methodRow}>
                                                    <CardIcon /> <span className={style.methodText}>{t('orders.prepaymentApp', 'Предоплата в приложении')}: <strong>{onlinePayment.toFixed(2)} {order.currency}</strong></span>
                                                </div>
                                            )}
                                            {directPayment > 0 && (
                                                <div className={style.methodRow}>
                                                    <WalletIcon /> <span className={style.methodText}>{t('orders.payDirectly', 'Оплата исполнителю')}: <strong>{directPayment.toFixed(2)} {order.currency}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Management Actions */}
                    <div className={style.card}>
                        {showCancelOrder && (
                            <button className={style.cancelBtn} onClick={handleCancel}>
                                <CloseIcon /> {t('orders.cancelOrderButton', 'Отменить заказ')}
                            </button>
                        )}
                        {needsPayment && (
                            <button className={style.payBtn} onClick={() => setPaymentModalOpen(true)} style={{ marginTop: 10 }}>
                                <CardIcon /> {t('orders.payNowButton', 'Оплатить сейчас')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isPaymentModalOpen && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    order={order}
                    userBalance={0} // modal will fetch
                    paymentMethods={[]} // modal will fetch
                    loadingData={false}
                    onPaymentSuccess={() => {
                        setPaymentModalOpen(false);
                        fetchOrder();
                    }}
                />
            )}
        </div>
    );
};

export default OrderDetails;