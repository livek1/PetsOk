import React, { useState, useEffect } from 'react';
import { getPaymentMethods, getVerificationUrl, setDefaultPaymentMethod } from '../../../../services/api';
import style from '../../../../style/pages/cabinet/becomeSitter/StepAddCard.module.scss';
import wizardStyle from '../BecomeSitterWizard.module.scss';

// Иконки
const CardIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const LockIconSmall = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: -2, marginRight: 4 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

const StepAddCard = ({ onNext }: { onNext: () => void }) => {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const loadCards = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPaymentMethods();
            setCards(res.data || []);
        } catch (e: any) {
            setError('Не удалось загрузить список карт');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCards(); }, []);

    const handleAddCard = async () => {
        setIsAdding(true);
        try {
            const returnUrl = window.location.href;
            const res = await getVerificationUrl({ return_url_mobile_base: returnUrl });
            const url = res.webview_url || res.checkout_url;

            if (url) {
                window.location.href = url;
            } else {
                alert('Ошибка получения ссылки на оплату');
            }
        } catch (e) {
            alert('Ошибка создания сессии оплаты');
        } finally {
            setIsAdding(false);
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await setDefaultPaymentMethod(id);
            loadCards();
        } catch (e) {
            alert('Ошибка выбора карты');
        }
    };

    const handleContinue = async () => {
        const active = cards.find(c => c.status === 'active' && c.is_default);
        if (!active) {
            const anyActive = cards.find(c => c.status === 'active');
            if (anyActive) {
                await setDefaultPaymentMethod(anyActive.id);
            } else {
                return alert('Пожалуйста, привяжите карту для получения выплат.');
            }
        }
        onNext();
    };

    if (loading) return <div className={wizardStyle.centerLoader}>Загрузка...</div>;

    return (
        <div className={wizardStyle.stepCard}>
            <div className={style.headerBlock}>
                <div className={style.iconCircle}>
                    <CardIcon />
                </div>
                <h2>Получение выплат</h2>
                <div style={{ maxWidth: '480px', margin: '0 auto', lineHeight: '1.5', fontSize: '0.95rem', color: '#1A202C' }}>
                    <p style={{ marginBottom: '12px' }}>
                        Добавьте карту, чтобы мы могли переводить вам деньги за заказы. Это также помогает нам убедиться, что вы — реальный человек.
                    </p>

                    {/* --- ДОБАВЛЕНО ПРО ЗАМОРОЗКУ --- */}
                    <p style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#4A5568' }}>
                        Для проверки мы временно заморозим и сразу вернем небольшую сумму (обычно 2&nbsp;₽).
                    </p>
                    {/* ------------------------------- */}

                    <span style={{ display: 'block', fontSize: '0.85rem', opacity: 0.8, color: '#718096' }}>
                        <LockIconSmall /> Карту можно удалить в любое время.
                    </span>
                </div>
            </div>

            {error && <div className={style.errorMessage}>{error}</div>}

            <div className={style.cardsList}>
                {cards.map(card => {
                    const isDefault = card.is_default;
                    const isActive = card.status === 'active';

                    return (
                        <div
                            key={card.id}
                            className={`${style.cardItem} ${isDefault ? style.default : ''} ${!isActive ? style.inactive : ''}`}
                            onClick={() => isActive && !isDefault ? handleSetDefault(card.id) : null}
                        >
                            <div className={style.cardIcon}>
                                <CardIcon />
                            </div>
                            <div className={style.cardInfo}>
                                <h4>•••• {card.last4}</h4>
                                <span>{isActive ? `Годен до ${card.exp_month}/${card.exp_year}` : 'Неактивна'}</span>
                            </div>
                            <div className={style.cardActions}>
                                {isActive && (
                                    <div className={`${style.radio} ${isDefault ? style.checked : ''}`} />
                                )}
                            </div>
                        </div>
                    );
                })}

                <button
                    className={style.addCardBtn}
                    onClick={handleAddCard}
                    disabled={isAdding}
                >
                    <PlusIcon />
                    {isAdding ? 'Загрузка...' : 'Добавить карту'}
                </button>
            </div>

            <button
                className={wizardStyle.btnPrimary}
                onClick={handleContinue}
                style={{ marginTop: 30 }}
            >
                Продолжить
            </button>
        </div>
    );
};

export default StepAddCard;