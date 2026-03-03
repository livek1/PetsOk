import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createWorkerRequest, getAvailableCountries, getAvailableCities } from '@/services/api';
import style from '@/style/pages/cabinet/becomeSitter/StepLocation.module.scss'; // Новые стили

// Иконки
const GlobeIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const InfoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;

const StepLocation = ({ onNext }: { onNext: () => void }) => {
    const { t } = useTranslation();
    const [countries, setCountries] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [countryId, setCountryId] = useState('');
    const [cityId, setCityId] = useState('');

    // Режим "Свой город"
    const [showCustomCity, setShowCustomCity] = useState(false);
    const [customCityName, setCustomCityName] = useState('');

    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingCities, setLoadingCities] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Статус успешной отправки в Waitlist
    const [waitlistSuccess, setWaitlistSuccess] = useState(false);

    useEffect(() => {
        setLoadingCountries(true);
        getAvailableCountries()
            .then(res => setCountries(res.data || []))
            .catch(() => alert('Ошибка загрузки стран'))
            .finally(() => setLoadingCountries(false));
    }, []);

    useEffect(() => {
        if (countryId) {
            setLoadingCities(true);
            getAvailableCities(countryId)
                .then(res => setCities(res.data || []))
                .catch(() => setCities([]))
                .finally(() => setLoadingCities(false));
        } else {
            setCities([]);
        }
    }, [countryId]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCountryId(e.target.value);
        setCityId('');
        setShowCustomCity(false);
        setCustomCityName('');
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        let payload: any = {
            sitter: 1,
            walker: 1,
        };

        if (showCustomCity) {
            if (!customCityName.trim()) {
                setSubmitting(false);
                return alert('Введите название города');
            }
            payload.suggested_city_name = customCityName.trim();
            payload.suggested_city_country_id = countryId;
            payload.sitter_available_country_id = null;
            payload.sitter_available_city_id = null;
        } else {
            if (!cityId) {
                setSubmitting(false);
                return alert('Выберите город');
            }
            payload.sitter_available_country_id = countryId;
            payload.sitter_available_city_id = cityId;
            payload.suggested_city_name = null;
            payload.suggested_city_country_id = null;
        }

        try {
            const response = await createWorkerRequest(payload);

            // Если добавили в Waitlist (кастомный город)
            if (response && (response.status === 'waitlisted' || showCustomCity)) {
                setWaitlistSuccess(true);
            } else {
                // Если обычный город -> идем дальше
                onNext();
            }
        } catch (e: any) {
            alert(e.message || 'Ошибка создания заявки');
        } finally {
            setSubmitting(false);
        }
    };

    // Если успешно добавились в лист ожидания
    if (waitlistSuccess) {
        return (
            <div className={style.stepCard}>
                <div className={style.successContent}>
                    <div className={style.successIcon}>🎉</div>
                    <h2>{t('common.thankYou', 'Спасибо!')}</h2>
                    <p>
                        {t('waitlist.defaultMessage', 'Мы записали вас в лист ожидания. Как только мы запустимся в этом городе, вы узнаете об этом первыми!')}
                    </p>
                    <a href="/cabinet/profile" className={style.backLink}>
                        {t('common.backToHome', 'Вернуться в профиль')}
                    </a>
                </div>
            </div>
        );
    }

    if (loadingCountries) return <div className={style.loadingState}>Загрузка стран...</div>;

    return (
        <div className={style.stepCard}>
            <div className={style.header}>
                <div className={style.iconCircle}>
                    <GlobeIcon />
                </div>
                <h1>{t('becomeSitter.step1.title', 'Где вы планируете работать?')}</h1>
                <p>{t('becomeSitter.step1.subtitle', 'Выберите страну и город для начала.')}</p>
            </div>

            <div className={style.formGroup}>
                <label>{t('common.country', 'Страна')}</label>
                <select className={style.select} value={countryId} onChange={handleCountryChange}>
                    <option value="">{t('common.selectCountry', 'Выберите страну...')}</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.country_name}</option>)}
                </select>
            </div>

            {countryId && (
                <>
                    {!showCustomCity ? (
                        <>
                            <div className={style.formGroup}>
                                <label>{t('common.city', 'Город')}</label>
                                <select
                                    className={style.select}
                                    value={cityId}
                                    onChange={e => setCityId(e.target.value)}
                                    disabled={loadingCities}
                                >
                                    <option value="">
                                        {loadingCities ? 'Загрузка...' : cities.length > 0 ? t('common.selectCity', 'Выберите город...') : t('common.noCitiesFound', 'Города не найдены')}
                                    </option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
                                </select>
                            </div>

                            {/* --- БЛОК ПОДСКАЗКИ ПРО 20-30 КМ --- */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px', gap: '10px', color: '#718096', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                <div style={{ marginTop: '2px', flexShrink: 0, opacity: 0.7 }}><InfoIcon /></div>
                                <span>
                                    {t('becomeSitter.step1.cityHint', 'Если вашего города нет, выберите ближайший крупный город (в пределах 20-30 км) или укажите свой ниже.')}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className={style.customCityBlock}>
                            <div className={style.formGroup}>
                                <label>{t('becomeSitter.step1.yourCity', 'Напишите название вашего города')}</label>
                                <input
                                    className={style.input}
                                    value={customCityName}
                                    onChange={e => setCustomCityName(e.target.value)}
                                    placeholder={t('common.enterCityName', 'Например: Казань')}
                                />
                            </div>
                            <div className={style.waitlistInfo}>
                                <InfoIcon />
                                <p>{t('becomeSitter.step1.waitlistInfo', 'Мы добавим вас в лист ожидания и сообщим, когда запустимся в этом городе!')}</p>
                            </div>
                        </div>
                    )}

                    <button
                        className={style.toggleLink}
                        onClick={() => {
                            setShowCustomCity(!showCustomCity);
                            setCityId('');
                            setCustomCityName('');
                        }}
                    >
                        {showCustomCity
                            ? t('becomeSitter.step1.selectFromList', 'Вернуться к списку городов')
                            : t('becomeSitter.step1.customCityLink', 'Моего города нет в списке')
                        }
                    </button>
                </>
            )}

            <button
                className={style.btnPrimary}
                onClick={handleSubmit}
                disabled={submitting || !countryId || (!cityId && !customCityName)}
            >
                {submitting ? t('loading', 'Загрузка...') : (showCustomCity ? t('common.joinWaitlist', 'Вступить в лист ожидания') : t('common.next', 'Продолжить'))}
            </button>
        </div>
    );
};

export default StepLocation;