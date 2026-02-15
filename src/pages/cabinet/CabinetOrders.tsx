import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import { RootState } from '../../store';
import { getMyOrders, fetchUserBalance, getPaymentMethods } from '../../services/api';
import style from '../../style/pages/cabinet/CabinetOrders.module.scss';
import OrderItemCard from '../../components/orders/OrderItemCard';
import PaymentModal from '../../components/modals/PaymentModal';

// Иконки (SVG)
const EmptyIcon = () => <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="1"><path d="M9 17h6" /><path d="M9 12h6" /><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 8 20 8" /></svg>;
const PlusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

const CabinetOrders: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    // Payment Logic State
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any>(null);
    const [userBalance, setUserBalance] = useState({ amount: '0.00', currency: 'RUB', currency_symbol: '₽' });
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [modalLoading, setModalLoading] = useState(false);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchOrders = useCallback(async (pageNum = 1, isLoadMore = false) => {
        if (!isAuthenticated) return;

        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const includes = 'pets,worker.avatar,promo_code,requests,canceledBy,client,billing_periods.payment,billing_periods';
            const response = await getMyOrders(pageNum, { include: includes });

            if (isMounted.current && response.data) {
                const newOrders = response.data;
                if (isLoadMore) {
                    setOrders(prev => [...prev, ...newOrders.filter((o: any) => !prev.find((po: any) => po.id === o.id))]);
                } else {
                    setOrders(newOrders);
                }
                // @ts-ignore
                setTotalPages(response.pagination?.total_pages || 1);
                setPage(pageNum);
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (isMounted.current) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    // --- PAYMENT HANDLERS ---
    const handleInitiatePayment = async (order: any) => {
        if (order.status === 'draft') return;

        setSelectedOrderForPayment(order);
        setPaymentModalOpen(true);
        setModalLoading(true);

        try {
            const [balanceRes, methodsRes] = await Promise.all([
                fetchUserBalance(),
                getPaymentMethods()
            ]);

            if (isMounted.current) {
                const balanceData = balanceRes.data?.data || balanceRes.data;
                setUserBalance({
                    amount: balanceData?.amount || '0.00',
                    currency: order.currency || 'RUB',
                    currency_symbol: balanceData?.currency_symbol || (order.currency === 'RUB' ? '₽' : order.currency)
                });

                const methods = methodsRes.data || [];
                setPaymentMethods(methods.filter((m: any) => m.status === 'active'));
            }
        } catch (e) {
            console.error(e);
            alert(t('errors.fetchPaymentDataError', 'Не удалось загрузить данные для оплаты'));
            setPaymentModalOpen(false);
        } finally {
            if (isMounted.current) setModalLoading(false);
        }
    };

    // 1. Просто просмотр деталей (работает для всех статусов, включая draft)
    const handleViewDetails = (orderId: string) => {
        navigate(`/cabinet/orders/${orderId}`);
    };

    // 2. Продолжение заполнения (только для draft)
    const handleContinueDraft = (order: any) => {
        navigate(`/cabinet/orders/create?uuid=${order.id}`);
    };

    const handleLoadMore = () => {
        if (!loadingMore && page < totalPages) {
            fetchOrders(page + 1, true);
        }
    };

    const handleAddOrder = () => {
        navigate('/cabinet/orders/create');
    };

    if (loading && page === 1) return <div className={style.loader}>{t('loading', 'Загрузка...')}</div>;

    return (
        <div className={style.container}>
            {/* Убрали H1, оставили только кнопку справа */}
            <div className={style.header} style={{ justifyContent: 'flex-end' }}>
                <button className={style.createBtn} onClick={handleAddOrder}>
                    <PlusIcon /> {t('orders.createOrder', 'Создать заказ')}
                </button>
            </div>

            {orders.length === 0 ? (
                <div className={style.emptyState}>
                    <EmptyIcon />
                    <h3>{t('orders.noOrdersYet', 'У вас пока нет заказов')}</h3>
                    <p>{t('orders.emptyMessage', 'Для ваших лапок пока нет заказов. Давайте создадим первый!')}</p>
                    <button onClick={handleAddOrder} className={style.primaryBtn}>
                        {t('orders.createFirstOrder', 'Позаботиться о питомце')}
                    </button>
                </div>
            ) : (
                <div className={style.ordersList}>
                    {orders.map(order => (
                        <OrderItemCard
                            key={order.id}
                            order={order}
                            onPay={() => handleInitiatePayment(order)}
                            onDetails={() => handleViewDetails(order.id)}
                            onContinueDraft={() => handleContinueDraft(order)}
                            // @ts-ignore
                            onReview={() => { /* Логика отзывов */ }}
                        />
                    ))}

                    {page < totalPages && (
                        <button
                            className={style.loadMoreBtn}
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                        >
                            {loadingMore ? t('loading') : t('common.loadMore', 'Загрузить еще')}
                        </button>
                    )}
                </div>
            )}

            {isPaymentModalOpen && selectedOrderForPayment && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    order={selectedOrderForPayment}
                    userBalance={userBalance}
                    paymentMethods={paymentMethods}
                    loadingData={modalLoading}
                    onPaymentSuccess={() => {
                        setPaymentModalOpen(false);
                        fetchOrders(1); // Обновить список после оплаты
                    }}
                />
            )}
        </div>
    );
};

export default CabinetOrders;