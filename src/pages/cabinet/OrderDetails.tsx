import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/ru';
import style from '../../style/pages/cabinet/OrderDetails.module.scss';
import { getOrderDetails, cancelOrder, clientInitiateChatWithWorker } from '../../services/api';
import PaymentModal from '../../components/modals/PaymentModal';

// Иконки
const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const ChatIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const WalletIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const TimeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const StarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

const BILLING_PERIOD_STATUS = {
    PENDING_PAYMENT: 'pending_payment',
    PAID: 'paid',
    PAYMENT_FAILED: 'payment_failed'
};

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
            const includes = 'worker.avatar,tasks,billing_periods.payment,billing_periods.payout,reviews';
            const res = await getOrderDetails(id!, includes);
            // Проверка структуры ответа
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
        if (window.confirm(t('orders.confirmCancel', 'Вы уверены, что хотите отменить заказ?') as string)) {
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
    if (!order) return <div className={style.errorContainer}>Заказ не найден</div>;

    const worker = order.worker?.data;
    const billingPeriods = order.billing_periods?.data || [];
    const statusKey = `orderStatus.${order.status}`;

    const needsPayment = ['pending_platform_payment', 'pending_platform_fee', 'recurring_payment_failed'].includes(order.status);
    const amountToPay = order.amount_due_to_platform || 0;

    return (
        <div className={style.container}>
            <div className={style.header}>
                <button className={style.backBtn} onClick={() => navigate('/cabinet/orders')}>
                    <BackIcon /> <span>{t('common.back', 'Назад') as string}</span>
                </button>
                <div className={style.headerTitle}>
                    <h1>{t(`header.services.${order.service_type}`, 'Заказ') as string} #{order.id}</h1>
                    <span className={`${style.statusBadge} ${style[order.status]}`}>
                        {t(statusKey, order.status) as string}
                    </span>
                </div>
            </div>

            <div className={style.contentGrid}>
                <div className={style.mainColumn}>
                    {totalToPayDirectly > 0 && (
                        <div className={style.warningBox}>
                            <div className={style.warningIcon}><WalletIcon /></div>
                            <div className={style.warningContent}>
                                <h4>{t('orders.paymentRequiredTitle', 'Оплата исполнителю') as string}</h4>
                                <p>{t('orders.directPaymentWarningModal', { amount: totalToPayDirectly, defaultValue: `Необходимо оплатить ${totalToPayDirectly} напрямую исполнителю.` }) as string}</p>
                            </div>
                        </div>
                    )}

                    <div className={style.card}>
                        <h3 className={style.cardTitle}>{t('orders.orderDetails', 'Детали заказа') as string}</h3>
                        <div className={style.detailsList}>
                            <div className={style.detailRow}>
                                <div className={style.detailLabel}>
                                    <CalendarIcon /> {t('common.dates', 'Даты') as string}
                                </div>
                                <div className={style.detailValue}>
                                    {moment(order.start_date_local).format('D MMMM')} - {moment(order.end_date_local).format('D MMMM YYYY')}
                                </div>
                            </div>
                            <div className={style.detailRow}>
                                <div className={style.detailLabel}>
                                    <TimeIcon /> {t('common.duration', 'Длительность') as string}
                                </div>
                                <div className={style.detailValue}>
                                    {order.duration_minutes || 0} {t('common.min', 'мин') as string}
                                </div>
                            </div>
                            <div className={style.detailRow}>
                                <div className={style.detailLabel}>
                                    <WalletIcon /> {t('orders.pricePerUnit', 'Стоимость') as string}
                                </div>
                                <div className={style.detailValue}>
                                    {order.price_per_rate} {order.currency}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={style.card}>
                        <h3 className={style.cardTitle}>{t('orders.financialDetails', 'Финансы') as string}</h3>
                        <div className={style.billingList}>
                            {billingPeriods.length === 0 && <p className={style.emptyText}>Информация о периодах оплаты отсутствует</p>}
                            {billingPeriods.map((period: any) => (
                                <div key={period.id} className={style.billingItem}>
                                    <div className={style.billingHeader}>
                                        <span className={style.periodDate}>
                                            {moment(period.period_start).format('D MMM')} - {moment(period.period_end).format('D MMM')}
                                        </span>
                                        <span className={`${style.billingStatus} ${style[period.status]}`}>
                                            {period.status === 'paid' ? t('common.paid', 'Оплачено') : t('common.pending', 'Ожидает')}
                                        </span>
                                    </div>
                                    <div className={style.billingRow}>
                                        <span>Стоимость услуг</span>
                                        <span>{period.gross_amount} {order.currency}</span>
                                    </div>
                                    <div className={style.billingRow}>
                                        <span>Предоплата (в приложении)</span>
                                        <span className={style.moneyBold}>{period.amount_due_from_client} {order.currency}</span>
                                    </div>
                                    {parseFloat(period.amount_payable_directly_to_worker) > 0 && (
                                        <div className={style.billingRow}>
                                            <span>На руки исполнителю</span>
                                            <span className={style.moneyBold}>{period.amount_payable_directly_to_worker} {order.currency}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {order.tasks?.data?.length > 0 && (
                        <div className={style.card}>
                            <h3 className={style.cardTitle}>{t('orders.visitsSchedule', 'Расписание') as string}</h3>
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
                                        <span className={`${style.taskStatus} ${style[task.status]}`}>
                                            {task.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className={style.sidebar}>
                    <div className={style.workerCard}>
                        <h3 className={style.cardTitle}>Исполнитель</h3>
                        {worker ? (
                            <div className={style.workerContent}>
                                <div className={style.workerHeader}>
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
                                    </div>
                                </div>

                                <div className={style.workerActions}>
                                    <button className={style.chatBtn} onClick={handleChat}>
                                        <ChatIcon /> Сообщение
                                    </button>
                                    <Link to={`/sitter/${worker.id}`} className={style.profileLink}>
                                        Профиль
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className={style.noWorkerState}>
                                <p>Исполнитель еще не назначен</p>
                            </div>
                        )}
                    </div>

                    <div className={style.actionsCard}>
                        {needsPayment && (
                            <button className={style.payBtn} onClick={() => setPaymentModalOpen(true)}>
                                Оплатить {amountToPay} {order.currency}
                            </button>
                        )}

                        {['pending_worker', 'pending_platform_payment'].includes(order.status) && (
                            <button className={style.cancelBtn} onClick={handleCancel}>
                                Отменить заказ
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