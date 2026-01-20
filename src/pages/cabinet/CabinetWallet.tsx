// --- File: src/pages/cabinet/CabinetWallet.tsx ---
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import style from '../../style/pages/cabinet/CabinetWallet.module.scss';
import {
    fetchUserBalance,
    fetchUserTransactions,
    getPaymentMethods,
    getVerificationUrl,
    setDefaultPaymentMethod,
    deletePaymentMethod
} from '../../services/api';
import { RootState } from '../../store';

// Иконки
const WalletIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"></path></svg>;
const CardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const ArrowUpIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>;
const ArrowDownIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;

const CabinetWallet: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useSelector((state: RootState) => state.auth);

    const [balance, setBalance] = useState({ amount: '0.00', currency_symbol: '₽' });
    const [cards, setCards] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null); // ID карты, с которой идет действие

    // --- Data Loading ---
    const loadData = useCallback(async () => {
        try {
            const [balanceRes, cardsRes, transactionsRes] = await Promise.all([
                fetchUserBalance(),
                getPaymentMethods(),
                fetchUserTransactions(1) // Первая страница транзакций
            ]);

            if (balanceRes?.data) setBalance(balanceRes.data);
            if (cardsRes?.data) setCards(cardsRes.data);
            if (transactionsRes?.data) setTransactions(transactionsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- Handlers ---
    const handleAddCard = async () => {
        try {
            // Для веба передаем текущий URL как возврат
            const currentUrl = window.location.href;
            const res = await getVerificationUrl({ return_url_mobile_base: currentUrl });

            // Если есть URL для редиректа (ЮКасса/Stripe Checkout)
            if (res.checkout_url || res.webview_url) {
                window.location.href = res.checkout_url || res.webview_url;
            }
        } catch (e) {
            console.error(e);
            alert(t('wallet.errorAddCard', 'Ошибка добавления карты'));
        }
    };

    const handleSetDefault = async (id: number) => {
        if (actionLoading) return;
        setActionLoading(id);
        try {
            await setDefaultPaymentMethod(id);
            await loadData(); // Перезагружаем список
        } catch (e) {
            console.error(e);
            alert('Ошибка установки основной карты');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteCard = async (id: number) => {
        if (!window.confirm(t('wallet.deleteCardConfirm', 'Удалить эту карту?'))) return;

        if (actionLoading) return;
        setActionLoading(id);
        try {
            await deletePaymentMethod(id);
            setCards(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            console.error(e);
            alert('Ошибка удаления карты');
        } finally {
            setActionLoading(null);
        }
    };

    // --- Helpers ---
    const getTransactionMeta = (type: string) => {
        const CREDIT_TYPES = ['credit_admin', 'order_cancel_refund', 'payout_reversal'];
        const DEBIT_TYPES = ['debit_admin', 'payment_debit', 'order_payment_balance'];

        if (CREDIT_TYPES.includes(type)) return { icon: <ArrowUpIcon />, className: style.credit, sign: '+' };
        if (DEBIT_TYPES.includes(type)) return { icon: <ArrowDownIcon />, className: style.debit, sign: '-' };

        return { icon: <WalletIcon />, className: style.neutral, sign: '' };
    };

    if (loading) return <div className={style.loader}>{t('loading')}</div>;

    return (
        <div className={style.container}>

            <div className={style.topGrid}>
                {/* 1. Карточка Баланса */}
                <div className={style.balanceCard}>
                    <div>
                        <h3>{t('wallet.balanceTitle', 'Текущий баланс')}</h3>
                        <div className={style.amount}>
                            {balance.amount} {balance.currency_symbol}
                        </div>
                    </div>
                    <div className={style.balanceFooter}>
                        {user?.email}
                    </div>
                </div>

                {/* 2. Карты */}
                <div className={style.cardsSection}>
                    <div className={style.header}>
                        <h3>{t('wallet.cardsTitle', 'Способы оплаты')}</h3>
                        <button className={style.addCardBtn} onClick={handleAddCard}>
                            <PlusIcon /> {t('wallet.addCard', 'Добавить')}
                        </button>
                    </div>

                    <div className={style.cardsList}>
                        {cards.length === 0 && (
                            <p className={style.emptyState} style={{ padding: 10 }}>{t('wallet.noCards', 'Нет привязанных карт')}</p>
                        )}
                        {cards.map(card => (
                            <div key={card.id} className={`${style.cardItem} ${card.is_default ? style.default : ''}`}>
                                <div className={style.cardIcon}>
                                    <CardIcon />
                                </div>
                                <div className={style.cardInfo}>
                                    <h4>
                                        •••• {card.last4}
                                        {card.is_default && <span className={style.defaultBadge}>{t('wallet.defaultCard', 'Основная')}</span>}
                                    </h4>
                                    <p>{card.brand} • {t('wallet.expires', 'Годен до')} {card.exp_month}/{card.exp_year}</p>
                                </div>
                                <div className={style.cardActions}>
                                    {!card.is_default && (
                                        <button
                                            className={style.actionBtn}
                                            title="Сделать основной"
                                            onClick={() => handleSetDefault(card.id)}
                                            disabled={actionLoading === card.id}
                                        >
                                            <CheckIcon />
                                        </button>
                                    )}
                                    <button
                                        className={`${style.actionBtn} ${style.delete}`}
                                        title="Удалить"
                                        onClick={() => handleDeleteCard(card.id)}
                                        disabled={actionLoading === card.id}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. История Транзакций */}
            <div className={style.historySection}>
                <h3>{t('wallet.historyTitle', 'История операций')}</h3>

                <div className={style.transactionsList}>
                    {transactions.length === 0 ? (
                        <div className={style.emptyState}>
                            {t('wallet.noTransactions', 'История операций пуста')}
                        </div>
                    ) : (
                        transactions.map(tx => {
                            const meta = getTransactionMeta(tx.type);
                            return (
                                <div key={tx.id} className={style.transactionItem}>
                                    <div className={style.txLeft}>
                                        <div className={`${style.txIcon} ${meta.className}`}>
                                            {meta.icon}
                                        </div>
                                        <div className={style.txInfo}>
                                            <h4>{tx.description || 'Операция'}</h4>
                                            <span>{tx.type}</span>
                                        </div>
                                    </div>
                                    <div className={style.txRight}>
                                        <span className={`${style.txAmount} ${meta.className}`}>
                                            {meta.sign}{tx.amount} {tx.currency_code}
                                        </span>
                                        <div className={style.txDate}>
                                            {moment(tx.created_at).format('D MMM YYYY, HH:mm')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default CabinetWallet;