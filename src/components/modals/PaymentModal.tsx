// --- File: src/components/modals/PaymentModal.tsx ---
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from "react-dom";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'; // Добавлены хуки Redux
import { initiateOrderPayment, getVerificationUrl } from '../../services/api';
import style from '../../style/components/modals/PaymentModal.module.scss';
import { AppDispatch, RootState } from '../../store';
import { fetchPaymentMethodsAction, selectActivePaymentMethods } from '../../store/slices/paymentSlice'; // Импорт действий и селектора

// Иконки
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const CardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const WalletIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"></path></svg>;
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

const PAYMENT_FLOW = {
    PLATFORM_PREPAY: 'platform_prepay',
    PLATFORM_FEE_ONLY: 'platform_fee_only',
    DIRECT_TO_WORKER: 'direct_to_worker',
};

const BILLING_PERIOD_STATUS = {
    PENDING_PAYMENT: 'pending_payment',
    PAYMENT_FAILED: 'payment_failed'
};

const ORDER_STATUS = {
    PENDING_PLATFORM_PAYMENT: 'pending_platform_payment',
    PENDING_PLATFORM_FEE: 'pending_platform_fee',
};

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
    userBalance: any;
    paymentMethods?: any[]; // Делаем необязательным, так как берем из Redux
    loadingData?: boolean;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen, onClose, order, userBalance, loadingData, onPaymentSuccess
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    // Получаем карты из Redux хранилища
    const cards = useSelector(selectActivePaymentMethods);
    const { isLoading: isCardsLoading } = useSelector((state: RootState) => state.payment);

    const [mounted, setMounted] = useState(false);
    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
    const [useBalance, setUseBalance] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setMounted(true);
        let root = document.getElementById('modal-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'modal-root';
            document.body.appendChild(root);
        }
    }, []);

    // При открытии модалки запускаем фоновое обновление карт
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchPaymentMethodsAction());
        }
    }, [isOpen, dispatch]);

    // Логика автовыбора карты при изменении списка карт (из кэша или после загрузки)
    useEffect(() => {
        if (cards && cards.length > 0) {
            // Если карта уже выбрана и она существует в списке — ничего не делаем
            if (selectedMethodId && cards.find((c: any) => c.id === selectedMethodId)) return;

            // Иначе выбираем дефолтную или первую попавшуюся
            const defaultCard = cards.find((c: any) => c.is_default) || cards[0];
            setSelectedMethodId(defaultCard.id);
        }
    }, [cards, selectedMethodId]);

    // --- ЛОГИКА РАСЧЕТА ---
    const calculations = useMemo(() => {
        if (!order) return null;
        let { payment_flow_type, status } = order;

        if (!payment_flow_type) {
            if (status === ORDER_STATUS.PENDING_PLATFORM_FEE) payment_flow_type = PAYMENT_FLOW.PLATFORM_FEE_ONLY;
            else if (status === ORDER_STATUS.PENDING_PLATFORM_PAYMENT) payment_flow_type = PAYMENT_FLOW.PLATFORM_PREPAY;
            else payment_flow_type = PAYMENT_FLOW.PLATFORM_PREPAY;
        }

        const {
            billing_periods, currency, agreed_price, discount_amount,
            amount_due_to_platform: orderLevelPlatformAmount,
        } = order;

        let paymentDueToPlatformNow = 0;
        let paymentTitleKey = 'orders.paymentTitle';
        let payButtonTextKey = 'orders.payButtonAmount';

        const unpaidPeriod = billing_periods?.data?.find((bp: any) =>
            bp.status === BILLING_PERIOD_STATUS.PENDING_PAYMENT ||
            bp.status === BILLING_PERIOD_STATUS.PAYMENT_FAILED
        );

        if (payment_flow_type === PAYMENT_FLOW.PLATFORM_PREPAY) {
            if (unpaidPeriod) {
                paymentDueToPlatformNow = parseFloat(unpaidPeriod.amount_due_from_client || '0');
            } else {
                paymentDueToPlatformNow = parseFloat(agreed_price || '0') - parseFloat(discount_amount || '0');
            }
        } else if (payment_flow_type === PAYMENT_FLOW.PLATFORM_FEE_ONLY) {
            paymentTitleKey = 'orders.prepaymentTitle';
            payButtonTextKey = 'orders.payBookingFeeButtonAmount';
            if (unpaidPeriod) {
                paymentDueToPlatformNow = parseFloat(unpaidPeriod.amount_due_to_platform || unpaidPeriod.amount_due_from_client || '0');
            } else {
                paymentDueToPlatformNow = parseFloat(orderLevelPlatformAmount || '0');
            }
        }

        paymentDueToPlatformNow = Math.max(0, paymentDueToPlatformNow);
        const balanceAmount = parseFloat(userBalance?.amount || '0');
        const orderCurrency = currency || 'RUB';
        const symbol = orderCurrency === 'RUB' ? '₽' : (userBalance?.currency_symbol || orderCurrency);

        let fromBalance = 0;
        let fromCard = 0;

        if (useBalance && paymentDueToPlatformNow > 0) {
            fromBalance = Math.min(paymentDueToPlatformNow, balanceAmount);
            fromCard = Math.max(0, paymentDueToPlatformNow - fromBalance);
        } else {
            fromCard = paymentDueToPlatformNow;
        }

        return {
            dueAmount: paymentDueToPlatformNow.toFixed(2),
            fromBalance: fromBalance.toFixed(2),
            fromCard: fromCard.toFixed(2),
            currencySymbol: symbol,
            paymentTitleKey,
            payButtonTextKey,
            cardRequired: fromCard > 0.001
        };
    }, [order, userBalance, useBalance]);

    const handlePay = async () => {
        if (processing || !calculations) return;
        if (calculations.cardRequired && !selectedMethodId) return alert(t('orders.selectCardPrompt', 'Выберите карту'));

        setProcessing(true);
        try {
            const currentUrl = window.location.origin + window.location.pathname;
            const res = await initiateOrderPayment(
                order.id,
                selectedMethodId,
                useBalance,
                true,
                currentUrl
            );

            if (res.success) {
                if (res.confirmation_needed && res.confirmation_url) {
                    window.location.href = res.confirmation_url;
                } else {
                    onPaymentSuccess();
                }
            } else {
                alert(res.message || 'Ошибка оплаты');
            }
        } catch (e: any) {
            alert(e.response?.data?.message || 'Ошибка оплаты');
        } finally {
            setProcessing(false);
        }
    };

    const handleAddCard = async () => {
        try {
            const currentUrl = window.location.origin + window.location.pathname;
            const res = await getVerificationUrl({ return_url_mobile_base: currentUrl });
            if (res.checkout_url || res.webview_url) {
                window.location.href = res.checkout_url || res.webview_url;
            }
        } catch (e) {
            console.error(e);
            alert('Ошибка добавления карты');
        }
    };

    if (!mounted || !isOpen) return null;
    const modalRoot = document.getElementById('modal-root') || document.body;

    return ReactDOM.createPortal(
        <div className={style.overlay} onClick={onClose}>
            <div className={style.modal} onClick={e => e.stopPropagation()}>
                <div className={style.header}>
                    <h3>{calculations ? t(calculations.paymentTitleKey, 'Оплата') : t('loading')}</h3>
                    <button onClick={onClose} className={style.closeBtn}><CloseIcon /></button>
                </div>

                {loadingData ? (
                    <div className={style.loaderContainer}>
                        <div className={style.spinner}></div>
                    </div>
                ) : (
                    <div className={style.content}>
                        {/* Баланс */}
                        {parseFloat(calculations?.dueAmount || '0') > 0 && (
                            <div className={`${style.optionRow} ${useBalance ? style.active : ''}`} onClick={() => setUseBalance(!useBalance)}>
                                <div className={style.rowIcon}><WalletIcon /></div>
                                <div className={style.rowInfo}>
                                    <span className={style.rowTitle}>{t('orders.payFromBalance', 'Списать с баланса')}</span>
                                    <span className={style.rowSub}>{userBalance?.amount} {userBalance?.currency_symbol}</span>
                                </div>
                                <div className={style.checkbox}>{useBalance ? '✓' : ''}</div>
                            </div>
                        )}

                        {/* Карты */}
                        {(calculations?.cardRequired || (cards && cards.length > 0)) && (
                            <div className={style.section}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4>
                                        {calculations?.cardRequired
                                            ? t('orders.selectPaymentMethod', 'Выберите карту для оплаты')
                                            : t('paymentMethods.yourCards', 'Ваши карты')
                                        }
                                    </h4>
                                    {/* Индикатор обновления в фоне */}
                                    {isCardsLoading && <span style={{ fontSize: 12, color: '#A0AEC0' }}>Обновление...</span>}
                                </div>

                                {/* Если карт нет совсем и идет первая загрузка - спиннер. Иначе список. */}
                                {isCardsLoading && cards.length === 0 ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                        <div className={style.spinner} style={{ width: 24, height: 24, borderWidth: 2 }}></div>
                                    </div>
                                ) : cards && cards.length > 0 ? (
                                    cards.map((card: any) => {
                                        const isActive = card.status === 'active';
                                        const expiry = card.exp_month && card.exp_year ? `${String(card.exp_month).padStart(2, '0')}/${String(card.exp_year).slice(-2)}` : '';

                                        return (
                                            <div
                                                key={card.id}
                                                className={`${style.optionRow} ${selectedMethodId === card.id ? style.active : ''} ${!isActive ? style.disabled : ''}`}
                                                onClick={() => isActive && setSelectedMethodId(card.id)}
                                            >
                                                <div className={style.rowIcon}>
                                                    <CardIcon />
                                                </div>
                                                <div className={style.rowInfo}>
                                                    <div className={style.cardTitleRow}>
                                                        <span className={style.rowTitle}>
                                                            {card.brand || 'Card'} •••• {card.last4}
                                                        </span>
                                                        {card.is_default && isActive && (
                                                            <span className={style.defaultBadge}>({t('common.default', 'Осн.')})</span>
                                                        )}
                                                    </div>

                                                    {expiry && <span className={style.rowSub}>{t('paymentMethods.expires', 'Срок')}: {expiry}</span>}

                                                    {!isActive && (
                                                        <span className={style.errorText}>
                                                            {t(`paymentMethods.status.${card.status}`, card.status)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={style.radio}>
                                                    {isActive && (selectedMethodId === card.id ? '●' : '○')}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className={style.emptyText}>{t('paymentMethods.noCardsSaved', 'Нет сохраненных карт')}</p>
                                )}

                                <button className={style.addCardBtn} onClick={handleAddCard}>
                                    <PlusIcon /> {t('paymentMethods.addCard', 'Добавить карту')}
                                </button>
                            </div>
                        )}

                        {/* Итого */}
                        {parseFloat(calculations?.dueAmount || '0') > 0 && (
                            <div className={style.summary}>
                                <div className={style.sumRow}>
                                    <span>{t('orders.paymentDueFull', 'К оплате')}:</span>
                                    <span className={style.sumVal}>{calculations?.dueAmount} {calculations?.currencySymbol}</span>
                                </div>
                                {useBalance && parseFloat(calculations?.fromBalance || '0') > 0 && (
                                    <div className={`${style.sumRow} ${style.discount}`}>
                                        <span>{t('orders.fromBalance', 'Баланс')}:</span>
                                        <span>- {calculations?.fromBalance} {calculations?.currencySymbol}</span>
                                    </div>
                                )}
                                <div className={`${style.sumRow} ${style.total}`}>
                                    <span>{t('orders.fromCard', 'С карты')}:</span>
                                    <span>{calculations?.fromCard} {calculations?.currencySymbol}</span>
                                </div>
                            </div>
                        )}

                        <button
                            className={style.payButton}
                            onClick={handlePay}
                            disabled={processing || (calculations?.cardRequired && !selectedMethodId)}
                        >
                            {processing
                                ? t('common.processing', 'Обработка...')
                                : t(calculations?.payButtonTextKey || 'orders.payButtonAmount', { amount: calculations?.dueAmount, defaultValue: `Оплатить ${calculations?.dueAmount || ''}` })
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>,
        modalRoot
    );
};

export default PaymentModal;