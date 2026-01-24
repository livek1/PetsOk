// --- File: src/pages/cabinet/becomeSitter/steps/StepSubscription.tsx ---
import React, { useEffect, useState } from 'react';
import { getSubscriptionPlans, createSubscription } from '../../../../services/api';
import style from '../../../../style/pages/cabinet/becomeSitter/StepSubscription.module.scss';
import wizardStyle from '../BecomeSitterWizard.module.scss';
import { useTranslation } from 'react-i18next'; // Импортируем хук переводов

// Иконки
const PercentIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>;
const SearchIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const StarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const BoltIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;

const StepSubscription = ({ onNext }: { onNext: () => void }) => {
    const { t } = useTranslation(); // Инициализация переводов

    const [monthlyPlan, setMonthlyPlan] = useState<any>(null);
    const [yearlyPlan, setYearlyPlan] = useState<any>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('year');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Логика удержания (скидка)
    const [isDiscountOffered, setIsDiscountOffered] = useState(false);

    const loadPlans = async (promoCode?: string) => {
        try {
            const params = promoCode ? { promo_code: promoCode } : {};
            const res = await getSubscriptionPlans(params);
            const plans = res.data || [];

            const month = plans.find((p: any) => p.billingInterval === 'month');
            const year = plans.find((p: any) => p.billingInterval === 'year');

            setMonthlyPlan(month);
            setYearlyPlan(year);

            if (year && !selectedPeriod) setSelectedPeriod('year');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlans();
    }, []);

    const performSubscriptionRequest = async (forceNewCard = false) => {
        const plan = selectedPeriod === 'year' ? yearlyPlan : monthlyPlan;
        if (!plan) return;

        // Текущий URL для возврата после оплаты
        const currentUrl = window.location.href;

        const payload: any = {
            plan_id: plan.id,
            return_url_mobile: currentUrl // Важно передать URL
        };

        if (isDiscountOffered) payload.promo_code = 'RETENTION_50';

        // Если принудительно новая карта (или повтор после ошибки)
        if (forceNewCard) {
            payload.save_new_card = true;
            payload.payment_method_id = null; // Явно указываем, что метод не выбран
        }

        const res = await createSubscription(payload);

        // Проверяем, есть ли ссылка для редиректа
        const redirectUrl = res.confirmation_url || res.url || (res.data && res.data.confirmation_url);

        if (redirectUrl) {
            window.location.href = redirectUrl; // Редирект на ЮКассу/Stripe
        } else {
            // Если ссылки нет, значит оплата прошла успешно сразу (например, была сохраненная карта)
            onNext();
        }
    };

    const handleSubscribe = async () => {
        setProcessing(true);
        try {
            // 1. Пробуем создать подписку "как обычно" (с дефолтной картой)
            await performSubscriptionRequest(false);
        } catch (e: any) {
            console.log("Subscription attempt failed:", e.response?.data);

            // Получаем код/сообщение ошибки
            const errorMsg = e.response?.data?.message || '';
            const errorCode = e.response?.data?.code || '';
            const status = e.response?.status;

            // Список признаков того, что карты нет или оплата не прошла
            const isPaymentError =
                status === 404 || // Payment method not found
                status === 402 || // Payment Required
                status === 422 || // Validation error (иногда)
                errorCode === 'PAY_METH_001' ||
                errorMsg.includes('Payment method not found') ||
                errorMsg.includes('Не найден') ||
                errorMsg.includes('failed');

            if (isPaymentError) {
                // 2. Если ошибка оплаты/нет карты -> Пробуем еще раз с флагом save_new_card
                // Это заставит бэкенд вернуть ссылку на оплату
                try {
                    console.log("Retrying with new card flow...");
                    await performSubscriptionRequest(true);
                } catch (retryError: any) {
                    // Если и тут ошибка — выводим алерт
                    alert(retryError.response?.data?.message || 'Ошибка при переходе к оплате');
                    setProcessing(false);
                }
            } else {
                // Если ошибка другого типа (например, сервер упал), просто выводим
                alert(errorMsg || 'Ошибка создания подписки');
                setProcessing(false);
            }
        }
        // setProcessing(false) не вызываем здесь в случае успеха, так как будет редирект
    };

    const handleSkip = async () => {
        if (!isDiscountOffered) {
            setIsDiscountOffered(true);
            await loadPlans('RETENTION_50');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (window.confirm('Вы уверены? Комиссия составит 20%. Скидка 50% сгорит навсегда.')) {
                onNext();
            }
        }
    };

    if (loading) return <div className={wizardStyle.centerLoader}>Загрузка тарифов...</div>;

    const currentPlan = selectedPeriod === 'year' ? yearlyPlan : monthlyPlan;
    const currencySymbol = currentPlan?.currency?.symbol || '₽';
    const hasOffer = currentPlan?.is_offer && currentPlan?.offer_details;
    const price = (isDiscountOffered && hasOffer) ? currentPlan.offer_details.offer_price : currentPlan?.price || 0;
    const oldPrice = (isDiscountOffered && hasOffer) ? currentPlan.offer_details.original_price : null;

    return (
        <div className={wizardStyle.stepCard}>
            <div className={style.headerBlock}>
                <h2>Ваш заработок на максимум</h2>
            </div>

            <div className={style.benefitCard}>
                <div className={style.topRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PercentIcon />
                        <span className={style.label}>КОМИССИЯ СЕРВИСА</span>
                    </div>
                    <span className={style.value}>0%</span>
                </div>
                <p>Без подписки комиссия составляет 20%.</p>
            </div>

            <div className={style.featuresList}>
                <div className={style.feature}>
                    <div className={style.icon}><SearchIcon /></div>
                    <h5>Топ выдачи</h5>
                    <p>Вас видят в 3 раза чаще</p>
                </div>
                <div className={style.feature}>
                    <div className={style.icon}><StarIcon /></div>
                    <h5>Бейдж PRO</h5>
                    <p>Выше доверие клиентов</p>
                </div>
                <div className={style.feature}>
                    <div className={style.icon}><BoltIcon /></div>
                    <h5>Приоритет</h5>
                    <p>Доступ к заказам раньше</p>
                </div>
            </div>

            {isDiscountOffered && (
                <div className={style.discountBanner}>
                    🔥 ЦЕНА СНИЖЕНА НА 50%
                </div>
            )}

            <div className={style.toggleContainer}>
                <div
                    className={`${style.toggleOption} ${selectedPeriod === 'year' ? style.active : ''}`}
                    onClick={() => setSelectedPeriod('year')}
                >
                    <h4>12 мес {isDiscountOffered && <span style={{ color: '#FF5252' }}>(-50%)</span>}</h4>
                    <span className={style.price}>
                        {Math.round((isDiscountOffered && yearlyPlan?.offer_details ? yearlyPlan.offer_details.offer_price : yearlyPlan?.price) / 12)} {currencySymbol}/мес
                    </span>
                </div>
                <div
                    className={`${style.toggleOption} ${selectedPeriod === 'month' ? style.active : ''}`}
                    onClick={() => setSelectedPeriod('month')}
                >
                    <h4>1 мес</h4>
                    <span className={style.price}>
                        {isDiscountOffered && monthlyPlan?.offer_details ? monthlyPlan.offer_details.offer_price : monthlyPlan?.price} {currencySymbol}
                    </span>
                </div>
            </div>

            <div className={style.totalBlock}>
                <span>Итого к оплате:</span>
                <div>
                    {oldPrice && <span className={style.oldPrice}>{oldPrice} {currencySymbol}</span>}
                    <span className={style.finalPrice}>{price} {currencySymbol}</span>
                </div>
            </div>

            <button
                className={wizardStyle.btnPrimary}
                onClick={handleSubscribe}
                disabled={processing}
            >
                {processing ? 'Обработка...' : 'Активировать Premium'}
            </button>

            <button className={style.skipButton} onClick={handleSkip}>
                {isDiscountOffered ? 'Отказаться от 0% комиссии' : 'Продолжить с комиссией 20%'}
            </button>

            {/* --- НОВЫЙ БЛОК: Юридическая информация (Как на мобильном) --- */}
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: '#718096', lineHeight: '1.4' }}>
                {t('subscription.legalStart', 'Нажимая кнопку, вы соглашаетесь с ')}
                <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'underline' }}>
                    {t('common.termsOfService', 'Условиями использования')}
                </a>
                {t('subscription.legalAnd', ' и ')}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'underline' }}>
                    {t('common.privacyPolicy', 'Политикой конфиденциальности')}
                </a>.
            </div>
            {/* ------------------------------------------------------------- */}
        </div>
    );
};

export default StepSubscription;