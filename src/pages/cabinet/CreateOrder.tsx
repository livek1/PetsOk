import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from "react-dom";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { RootState } from '../../store';
import { getMyPets, createOrder, checkPromoCodeAPI, Pet } from '../../services/api';
import style from '../../style/pages/cabinet/CreateOrder.module.scss';

// --- ИМПОРТ ИКОНОК УСЛУГ ---
import BoardingIcon from '../../components/icons/BoardingIcon';
import HouseSittingIcon from '../../components/icons/HouseSittingIcon';
import DropInVisitsIcon from '../../components/icons/DropInVisitsIcon';
import DoggyDayCareIcon from '../../components/icons/DoggyDayCareIcon';
import DogWalkingIcon from '../../components/icons/DogWalkingIcon';

// Вспомогательные иконки
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const PawIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 7.8 14.2 7.8 12.75 6.35C11.3 4.9 11.3 2.9 12.75 1.45C14.2 0 16.2 0 17.65 1.45C19.1 2.9 19.1 4.9 17.65 6.35ZM6.35 6.35C7.8 4.9 7.8 2.9 6.35 1.45C4.9 0 2.9 0 1.45 1.45C0 2.9 0 4.9 1.45 6.35C2.9 7.8 4.9 7.8 6.35 6.35ZM22.55 1.45C21.1 0 19.1 0 17.65 1.45C16.2 2.9 16.2 4.9 17.65 6.35C19.1 7.8 21.1 7.8 22.55 6.35C24 4.9 24 2.9 22.55 1.45ZM1.45 12.55C2.9 11.1 4.9 11.1 6.35 12.55C7.8 14 7.8 16 6.35 17.45C4.9 18.9 2.9 18.9 1.45 17.45C0 16 0 14 1.45 12.55ZM12 9C9.24 9 7 11.24 7 14C7 16.76 9.24 19 12 19C14.76 19 17 16.76 17 14C17 11.24 14.76 9 12 9ZM12 24C9.24 24 7 21.76 7 19H17C17 21.76 14.76 24 12 24Z" /></svg>;
const ChevronDownIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const MapPinIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
// Иконка для ожидания/информации (оранжевая)
const HourglassIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2v20h16V2H4zm8 9l-4 4h8l-4-4zm0-9l4 4H8l4-4z" /></svg>;

const SERVICE_TYPES = {
    BOARDING: 'boarding',
    HOUSE_SITTING: 'house_sitting',
    DROP_IN_VISIT: 'drop_in_visit',
    DOGGY_DAY_CARE: 'doggy_day_care',
    WALKING: 'walking'
};

// --- КОНФИГУРАЦИЯ UI УСЛУГ ---
const SERVICE_UI_CONFIG: Record<string, any> = {
    [SERVICE_TYPES.BOARDING]: {
        icon: BoardingIcon,
        titleKey: 'bookingScreen.serviceTypes.boarding.name',
        descKey: 'bookingScreen.serviceTypes.boarding.description',
        defaultTitle: 'Передержка',
        defaultDesc: 'Ваш питомец ночует у ситтера'
    },
    [SERVICE_TYPES.HOUSE_SITTING]: {
        icon: HouseSittingIcon,
        titleKey: 'bookingScreen.serviceTypes.house_sitting.name',
        descKey: 'bookingScreen.serviceTypes.house_sitting.description',
        defaultTitle: 'Няня (у вас дома)',
        defaultDesc: 'Ситтер присматривает за питомцем у вас дома'
    },
    [SERVICE_TYPES.DROP_IN_VISIT]: {
        icon: DropInVisitsIcon,
        titleKey: 'bookingScreen.serviceTypes.drop_in_visit.name',
        descKey: 'bookingScreen.serviceTypes.drop_in_visit.description',
        defaultTitle: 'Визиты',
        defaultDesc: 'Ситтер заходит покормить и поиграть'
    },
    [SERVICE_TYPES.DOGGY_DAY_CARE]: {
        icon: DoggyDayCareIcon,
        titleKey: 'bookingScreen.serviceTypes.doggy_day_care.name',
        descKey: 'bookingScreen.serviceTypes.doggy_day_care.description',
        defaultTitle: 'Дневной уход',
        defaultDesc: 'Питомец проводит день у ситтера, ночует дома'
    },
    [SERVICE_TYPES.WALKING]: {
        icon: DogWalkingIcon,
        titleKey: 'bookingScreen.serviceTypes.walking.name',
        descKey: 'bookingScreen.serviceTypes.walking.description',
        defaultTitle: 'Выгул',
        defaultDesc: 'Прогулка с вашей собакой в вашем районе'
    }
};

const PERIOD_ONLY_SERVICES = [SERVICE_TYPES.BOARDING, SERVICE_TYPES.HOUSE_SITTING];
const VISIT_SERVICES = [SERVICE_TYPES.DROP_IN_VISIT, SERVICE_TYPES.WALKING];
const DAY_CARE_SERVICE = SERVICE_TYPES.DOGGY_DAY_CARE;
const SCHEDULE_TYPES = { ONE_TIME: 'one_time', RECURRING: 'recurring' };

const WEEKDAYS = [
    { id: 1, key: 'mon', label: 'Пн' }, { id: 2, key: 'tue', label: 'Вт' }, { id: 3, key: 'wed', label: 'Ср' },
    { id: 4, key: 'thu', label: 'Чт' }, { id: 5, key: 'fri', label: 'Пт' }, { id: 6, key: 'sat', label: 'Сб' }, { id: 0, key: 'sun', label: 'Вс' }
];

const DURATIONS = [
    { id: '15m', key: 'min15', label: '15 мин' },
    { id: '30m', key: 'min30', label: '30 мин' },
    { id: '1h', key: 'hr1', label: '1 час' }
];

const TIMES = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);
const MIN_BOOKING_LEAD_TIME_HOURS = 3;

// Получаем корневой элемент для порталов
const modalRoot = document.getElementById('modal-root') || document.body;

const CreateOrder: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { activeServices, isConfigLoaded } = useSelector((state: RootState) => state.config);

    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [scheduleType, setScheduleType] = useState(SCHEDULE_TYPES.ONE_TIME);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [recurringStartDate, setRecurringStartDate] = useState<string>('');
    const [recurringWeekdays, setRecurringWeekdays] = useState<number[]>([]);

    const [duration, setDuration] = useState<string | null>(null);
    const [visitsPerDay, setVisitsPerDay] = useState(1);
    const [visitTimes, setVisitTimes] = useState<Record<number, string>>({});

    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPets, setSelectedPets] = useState<number[]>([]);

    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [checkedPromoCodeData, setCheckedPromoCodeData] = useState<any>(null);
    const [promoLoading, setPromoLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPetLoading, setIsPetLoading] = useState(true);

    // --- МОДАЛЬНЫЕ ОКНА ---
    const [addressError, setAddressError] = useState<string | null>(null);
    const [noWorkersMessage, setNoWorkersMessage] = useState<string | null>(null);

    const isPeriodOnly = useMemo(() => selectedService && PERIOD_ONLY_SERVICES.includes(selectedService), [selectedService]);
    const isVisit = useMemo(() => selectedService && VISIT_SERVICES.includes(selectedService), [selectedService]);
    const isDayCare = useMemo(() => selectedService === DAY_CARE_SERVICE, [selectedService]);
    const effectiveScheduleType = isPeriodOnly ? SCHEDULE_TYPES.ONE_TIME : scheduleType;

    useEffect(() => {
        getMyPets().then(data => {
            setPets(data);
            setIsPetLoading(false);
        }).catch(e => {
            console.error(e);
            setIsPetLoading(false);
        });
    }, []);

    const availableServices = useMemo(() => {
        const all = Object.values(SERVICE_TYPES);
        if (!isConfigLoaded) return all;
        return all.filter(s => activeServices.includes(s));
    }, [activeServices, isConfigLoaded]);

    const handleServiceSelect = (service: string) => {
        if (selectedService === service) return;
        setSelectedService(service);
        setStartDate('');
        setEndDate('');
        setRecurringStartDate('');
        setRecurringWeekdays([]);
        setDuration(null);
        setVisitsPerDay(1);
        setVisitTimes({});
        setErrors({});
    };

    const isTimeDisabled = (time: string) => {
        if (!isVisit && !isDayCare) return false;
        const dateToCheck = effectiveScheduleType === SCHEDULE_TYPES.RECURRING ? recurringStartDate : startDate;
        if (!dateToCheck || !moment(dateToCheck).isSame(moment(), 'day')) return false;
        const visitDateTime = moment(`${dateToCheck} ${time}`, 'YYYY-MM-DD HH:mm');
        const cutoff = moment().add(MIN_BOOKING_LEAD_TIME_HOURS, 'hours');
        return visitDateTime.isBefore(cutoff);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!selectedService) newErrors.service = t('bookingScreen.errors.selectService', 'Выберите услугу') as string;
        if (selectedService) {
            if (effectiveScheduleType === SCHEDULE_TYPES.RECURRING) {
                if (!recurringStartDate) newErrors.when = t('bookingScreen.errors.selectStartDate', 'Выберите дату начала') as string;
                if (recurringWeekdays.length === 0) newErrors.when = t('bookingScreen.errors.selectRecurringDays', 'Выберите дни повторения') as string;
                if ((isVisit || isDayCare) && !duration) newErrors.when = t('bookingScreen.errors.selectDuration', 'Выберите длительность') as string;
            } else {
                if (!startDate) newErrors.when = t('bookingScreen.errors.selectStartDate', 'Выберите дату начала') as string;
                if (!endDate && !isVisit && !isDayCare) newErrors.when = t('bookingScreen.errors.selectEndDate', 'Выберите дату окончания') as string;
                if (endDate && moment(endDate).isBefore(startDate)) newErrors.when = t('bookingScreen.errors.endDateBeforeStart', 'Дата окончания не может быть раньше начала') as string;
                if ((isVisit || isDayCare) && !duration) newErrors.when = t('bookingScreen.errors.selectDuration', 'Выберите длительность') as string;
            }
            if ((isVisit || isDayCare) && visitsPerDay > 0) {
                const setTimesCount = Object.keys(visitTimes).length;
                if (setTimesCount < visitsPerDay) newErrors.when = t('bookingScreen.errors.setVisitTime', 'Укажите время визита') as string;
            }
        }
        if (selectedPets.length === 0) newErrors.pets = t('bookingScreen.errors.selectPet', 'Выберите питомца') as string;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setAddressError(null);
        setNoWorkersMessage(null);

        const payload = {
            service_type: selectedService,
            schedule_type: effectiveScheduleType,
            pets: selectedPets,
            start_date: effectiveScheduleType === SCHEDULE_TYPES.RECURRING ? recurringStartDate : startDate,
            end_date: effectiveScheduleType === SCHEDULE_TYPES.RECURRING ? null : (isPeriodOnly || isVisit ? endDate : startDate),
            recurring_days: effectiveScheduleType === SCHEDULE_TYPES.RECURRING ? recurringWeekdays : null,
            duration: duration,
            visits_per_day: (isVisit || isDayCare) ? visitsPerDay : null,
            visit_times: (isVisit || isDayCare) && visitsPerDay > 0 ? visitTimes : null,
            promo_code: checkedPromoCodeData?.code || (promoCodeInput.trim() || null),
        };

        try {
            const res = await createOrder(payload);
            if (res.status === 'success' || res.data?.id) {
                if (typeof AppMetrica !== 'undefined') {
                    AppMetrica.reportEvent('booking_create_order_succeeded', { service: selectedService });
                }
                navigate('/cabinet/orders');
            } else {
                alert(res.message || t('bookingScreen.errors.unknownError', 'Неизвестная ошибка') as string);
            }
        } catch (e: any) {
            console.error(e);

            const responseData = e.response?.data;
            const errorMessage = responseData?.message || e.message;

            // 1. Проверка на ошибку отсутствия адреса
            if (errorMessage && (
                errorMessage.toLowerCase().includes('адрес') ||
                errorMessage.toLowerCase().includes('address') ||
                errorMessage.toLowerCase().includes('местоположение')
            )) {
                setAddressError(errorMessage);
                return;
            }

            // 2. Проверка на отсутствие воркеров (Код 422 и ключ workers_availability)
            if (responseData?.errors?.workers_availability && responseData.errors.workers_availability.length > 0) {
                setNoWorkersMessage(responseData.errors.workers_availability[0]);
                return;
            }

            // 3. Остальные ошибки
            alert(errorMessage || t('bookingScreen.errors.unknownError') as string);
        } finally {
            setLoading(false);
        }
    };

    const checkPromo = async () => {
        if (!promoCodeInput.trim()) return;
        setPromoLoading(true);
        try {
            const res = await checkPromoCodeAPI({ code: promoCodeInput });
            if (res && res.data) {
                setCheckedPromoCodeData(res.data);
                setErrors(prev => ({ ...prev, promo: '' }));
            }
        } catch (e) {
            setErrors(prev => ({ ...prev, promo: t('bookingScreen.errors.promoCodeInvalid', 'Неверный промокод') as string }));
            setCheckedPromoCodeData(null);
        } finally {
            setPromoLoading(false);
        }
    };

    const getServiceName = (key: string) => {
        const config = SERVICE_UI_CONFIG[key];
        return t(config?.titleKey, config?.defaultTitle || key) as string;
    };

    return (
        <div className={style.container}>
            <h1 className={style.pageTitle}>{t('bookingScreen.title', 'Бронирование') as string}</h1>
            <div className={style.contentGrid}>
                <div className={style.mainColumn}>
                    <div className={`${style.card} ${errors.service ? style.errorBorder : ''}`}>
                        <h3 className={style.cardTitle}>{t('bookingScreen.sections.service.title', 'Что нужно?') as string}</h3>
                        <div className={style.servicesGrid}>
                            {availableServices.map(key => {
                                const uiConfig = SERVICE_UI_CONFIG[key];
                                const Icon = uiConfig?.icon || PawIcon;
                                const isSelected = selectedService === key;
                                return (
                                    <div
                                        key={key}
                                        className={`${style.serviceItem} ${isSelected ? style.selected : ''}`}
                                        onClick={() => handleServiceSelect(key)}
                                    >
                                        <div className={style.serviceIcon}>
                                            <Icon width={28} height={28} color={isSelected ? '#3598FE' : '#718096'} />
                                        </div>
                                        <span className={style.serviceName}>
                                            {t(uiConfig?.titleKey, uiConfig?.defaultTitle) as string}
                                        </span>
                                        <p className={style.serviceDesc}>
                                            {t(uiConfig?.descKey, uiConfig?.defaultDesc) as string}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.service && <div className={style.errorText}>{errors.service}</div>}
                    </div>

                    {selectedService && (
                        <div className={`${style.card} ${errors.when ? style.errorBorder : ''}`}>
                            <h3 className={style.cardTitle}>{t('bookingScreen.sections.schedule.title', 'Когда?') as string}</h3>
                            {!isPeriodOnly && (
                                <div className={style.tabs}>
                                    <button className={`${style.tab} ${scheduleType === SCHEDULE_TYPES.ONE_TIME ? style.active : ''}`} onClick={() => setScheduleType(SCHEDULE_TYPES.ONE_TIME)}>{t('bookingScreen.sections.schedule.oneTime', 'Разовая') as string}</button>
                                    <button className={`${style.tab} ${scheduleType === SCHEDULE_TYPES.RECURRING ? style.active : ''}`} onClick={() => setScheduleType(SCHEDULE_TYPES.RECURRING)}>{t('bookingScreen.sections.schedule.recurring', 'Регулярная') as string}</button>
                                </div>
                            )}

                            <div className={style.dateInputs}>
                                {effectiveScheduleType === SCHEDULE_TYPES.RECURRING ? (
                                    <div className={style.formGroup}>
                                        <label>{t('bookingScreen.sections.schedule.recurringStartDateInstruction', 'Выберите дату начала') as string}</label>
                                        <input type="date" className={style.input} value={recurringStartDate} min={moment().format('YYYY-MM-DD')} onChange={e => setRecurringStartDate(e.target.value)} />
                                    </div>
                                ) : (
                                    <>
                                        <div className={style.formGroup}>
                                            <label>{t('bookingScreen.sections.schedule.selectStartDate', 'Дата начала') as string}</label>
                                            <input type="date" className={style.input} value={startDate} min={moment().format('YYYY-MM-DD')} onChange={e => setStartDate(e.target.value)} />
                                        </div>
                                        {(!isVisit && !isDayCare) && (
                                            <div className={style.formGroup}>
                                                <label>{t('bookingScreen.sections.schedule.selectEndDate', 'Дата окончания') as string}</label>
                                                <input type="date" className={style.input} value={endDate} min={startDate || moment().format('YYYY-MM-DD')} onChange={e => setEndDate(e.target.value)} />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {effectiveScheduleType === SCHEDULE_TYPES.RECURRING && (
                                <div className={style.weekdaysBlock}>
                                    <label className={style.subLabel}>{t('bookingScreen.sections.schedule.repeatOnLabel', 'Повторять по') as string}</label>
                                    <div className={style.weekdaysRow}>
                                        {WEEKDAYS.map(day => (
                                            <button key={day.id} className={`${style.weekdayBtn} ${recurringWeekdays.includes(day.id) ? style.selected : ''}`} onClick={() => { if (recurringWeekdays.includes(day.id)) setRecurringWeekdays(prev => prev.filter(d => d !== day.id)); else setRecurringWeekdays(prev => [...prev, day.id]); }}>{day.label}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(isVisit || isDayCare) && (
                                <div className={style.visitSettings}>
                                    <label className={style.subLabel}>{t('bookingScreen.sections.schedule.durationLabel', 'Длительность') as string}</label>
                                    <div className={style.chipsRow}>
                                        {DURATIONS.map(d => (
                                            <button key={d.id} className={`${style.chip} ${duration === d.id ? style.selected : ''}`} onClick={() => setDuration(d.id)}>{t(`bookingScreen.durations.${d.key}`, d.label) as string}</button>
                                        ))}
                                    </div>
                                    {isVisit && (
                                        <>
                                            <label className={style.subLabel}>{t('bookingScreen.sections.schedule.visitsPerDayLabel', 'Визитов в день') as string}</label>
                                            <div className={style.chipsRow}>{[1, 2, 3].map(num => (<button key={num} className={`${style.chip} ${visitsPerDay === num ? style.selected : ''}`} onClick={() => setVisitsPerDay(num)}>{num}</button>))}</div>
                                            {Array.from({ length: visitsPerDay }).map((_, i) => (
                                                <div key={i} className={style.timeSelectRow}>
                                                    <span>{t('bookingScreen.sections.schedule.visitTimeLabel', { count: i + 1, defaultValue: 'Время визита' }) as string} {i + 1}</span>
                                                    <div className={style.selectWrapper}>
                                                        <select className={style.select} value={visitTimes[i + 1] || ''} onChange={e => setVisitTimes(prev => ({ ...prev, [i + 1]: e.target.value }))}>
                                                            <option value="">--:--</option>
                                                            {TIMES.map(time => (<option key={time} value={time} disabled={isTimeDisabled(time)}>{time} {isTimeDisabled(time) ? '(занято)' : ''}</option>))}
                                                        </select>
                                                        <div className={style.chevronIcon}><ChevronDownIcon /></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                            {errors.when && <div className={style.errorText}>{errors.when}</div>}
                        </div>
                    )}

                    <div className={`${style.card} ${errors.pets ? style.errorBorder : ''}`}>
                        <div className={style.cardHeaderRow}>
                            <h3 className={style.cardTitle}>{t('bookingScreen.sections.pets.title', 'Кого доверим?') as string}</h3>
                            <button className={style.linkBtn} onClick={() => navigate('/cabinet/pets/add')}>+ {t('bookingScreen.addPetButton', 'Добавить') as string}</button>
                        </div>
                        {isPetLoading ? <div className={style.loader}>{t('loading') as string}</div> : pets.length === 0 ? <p className={style.emptyText}>{t('bookingScreen.sections.pets.noPetsFound', 'Питомцы не найдены') as string}</p> : (
                            <div className={style.petsGrid}>
                                {pets.map(pet => {
                                    const isSelected = selectedPets.includes(pet.id);
                                    return (
                                        <div key={pet.id} className={`${style.petCard} ${isSelected ? style.selected : ''}`} onClick={() => isSelected ? setSelectedPets(prev => prev.filter(id => id !== pet.id)) : setSelectedPets(prev => [...prev, pet.id])}>
                                            <div className={style.petAvatar}>
                                                {pet.avatar ? <img src={pet.avatar.data?.preview_url || pet.avatar.data?.url} alt={pet.name} /> : <div className={style.placeholder}><PawIcon /></div>}
                                                {isSelected && <div className={style.checkBadge}><CheckIcon /></div>}
                                            </div>
                                            <span className={style.petName}>{pet.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {errors.pets && <div className={style.errorText}>{errors.pets}</div>}
                    </div>

                    <div className={style.card}>
                        <h3 className={style.cardTitle}>{t('bookingScreen.sections.promo.title', 'Промокод') as string}</h3>
                        <div className={style.promoRow}>
                            <input className={style.input} value={promoCodeInput} onChange={e => { setPromoCodeInput(e.target.value.toUpperCase()); setCheckedPromoCodeData(null); setErrors(prev => ({ ...prev, promo: '' })); }} placeholder={t('bookingScreen.promoCodePlaceholder', 'Введите промокод') as string} disabled={!!checkedPromoCodeData} />
                            {!checkedPromoCodeData ? <button className={style.btnSecondary} onClick={checkPromo} disabled={!promoCodeInput || promoLoading}>{promoLoading ? '...' : t('bookingScreen.applyButton', 'Применить') as string}</button> : <button className={style.btnDanger} onClick={() => { setCheckedPromoCodeData(null); setPromoCodeInput(''); }}>{t('bookingScreen.removeButton', 'Удалить') as string}</button>}
                        </div>
                        {checkedPromoCodeData && <p className={style.successText}>{t('bookingScreen.sections.promo.appliedMessage') as string} {checkedPromoCodeData.display_text}</p>}
                        {errors.promo && <div className={style.errorText}>{errors.promo}</div>}
                    </div>
                </div>

                <div className={style.sidebar}>
                    <div className={style.summaryCard}>
                        <h3 className={style.summaryTitle}>{t('bookingScreen.scheduleTitle', 'Расписание') as string}</h3>
                        <div className={style.summaryRow}><span>{t('bookingScreen.sections.service.title', 'Услуга') as string}:</span><span>{selectedService ? getServiceName(selectedService) : '-'}</span></div>
                        {selectedService && <div className={style.summaryRow}><span>{t('bookingScreen.sections.schedule.title', 'Когда') as string}:</span><span>{effectiveScheduleType === SCHEDULE_TYPES.ONE_TIME ? (startDate ? moment(startDate).format('D MMM') : '-') : (recurringStartDate ? `${moment(recurringStartDate).format('D MMM')}` : '-')}</span></div>}
                        <div className={style.summaryRow}><span>{t('bookingScreen.petsTitle', 'Питомцы') as string}:</span><span>{selectedPets.length > 0 ? selectedPets.length : '-'}</span></div>
                        <div className={style.divider} />
                        <button className={style.btnPrimary} onClick={handleSubmit} disabled={loading}>{loading ? t('loading') as string : t('bookingScreen.createRequestButton', 'Создать заявку') as string}</button>
                    </div>
                </div>
            </div>

            {/* --- МОДАЛЬНОЕ ОКНО ОШИБКИ АДРЕСА --- */}
            {addressError && ReactDOM.createPortal(
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <div className={style.modalIcon}>
                            <MapPinIcon />
                        </div>
                        <h3 className={style.modalTitle}>Требуется адрес</h3>
                        <p className={style.modalText}>
                            {addressError}
                        </p>
                        <div className={style.modalActions}>
                            <button
                                className={`${style.modalBtn} ${style.modalBtnPrimary}`}
                                onClick={() => navigate('/cabinet/profile')}
                            >
                                Указать адрес в профиле
                            </button>
                            <button
                                className={`${style.modalBtn} ${style.modalBtnSecondary}`}
                                onClick={() => setAddressError(null)}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>,
                modalRoot
            )}

            {/* --- МОДАЛЬНОЕ ОКНО "НЕТ ИСПОЛНИТЕЛЕЙ" --- */}
            {noWorkersMessage && ReactDOM.createPortal(
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <div className={style.modalIcon} style={{ backgroundColor: '#FFF8E1', color: '#DD6B20' }}>
                            <HourglassIcon />
                        </div>
                        <h3 className={style.modalTitle}>{t('common.info', 'Информация')}</h3>
                        <p className={style.modalText} style={{ marginBottom: 20 }}>
                            {noWorkersMessage}
                        </p>
                        <div className={style.modalActions}>
                            <button
                                className={`${style.modalBtn} ${style.modalBtnPrimary}`}
                                onClick={() => setNoWorkersMessage(null)}
                            >
                                {t('common.understood', 'Понятно')}
                            </button>
                        </div>
                    </div>
                </div>,
                modalRoot
            )}

        </div>
    );
};

export default CreateOrder;