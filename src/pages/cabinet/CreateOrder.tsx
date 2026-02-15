import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/ru';

// --- PHONE INPUT ---
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { RootState } from '../../store';
import {
    getMyPets,
    createDraftOrder,
    updateOrderContact,
    publishOrder,
    checkPromoCodeAPI,
    fetchAddressSuggestions,
    getOrderById
} from '../../services/api';
import style from '../../style/pages/cabinet/CreateOrder.module.scss';

// Иконки
import BoardingIcon from '../../components/icons/BoardingIcon';
import HouseSittingIcon from '../../components/icons/HouseSittingIcon';
import DropInVisitsIcon from '../../components/icons/DropInVisitsIcon';
import DoggyDayCareIcon from '../../components/icons/DoggyDayCareIcon';
import DogWalkingIcon from '../../components/icons/DogWalkingIcon';
import OrderCreatedModal from '../../components/modals/OrderCreatedModal';

// Вспомогательные иконки
const PawIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 7.8 14.2 7.8 12.75 6.35C11.3 4.9 11.3 2.9 12.75 1.45C14.2 0 16.2 0 17.65 1.45C19.1 2.9 19.1 4.9 17.65 6.35ZM6.35 6.35C7.8 4.9 7.8 2.9 6.35 1.45C4.9 0 2.9 0 1.45 1.45C0 2.9 0 4.9 1.45 6.35C2.9 7.8 4.9 7.8 6.35 6.35ZM22.55 1.45C21.1 0 19.1 0 17.65 1.45C16.2 2.9 16.2 4.9 17.65 6.35C19.1 7.8 21.1 7.8 22.55 6.35C24 4.9 24 2.9 22.55 1.45ZM1.45 12.55C2.9 11.1 4.9 11.1 6.35 12.55C7.8 14 7.8 16 6.35 17.45C4.9 18.9 2.9 18.9 1.45 17.45C0 16 0 14 1.45 12.55ZM12 9C9.24 9 7 11.24 7 14C7 16.76 9.24 19 12 19C14.76 19 17 16.76 17 14C17 11.24 14.76 9 12 9ZM12 24C9.24 24 7 21.76 7 19H17C17 21.76 14.76 24 12 24Z" /></svg>;
const ChevronDownIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const AlertIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const InfoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

const SERVICE_TYPES = {
    BOARDING: 'boarding',
    HOUSE_SITTING: 'house_sitting',
    DROP_IN_VISIT: 'drop_in_visit',
    DOGGY_DAY_CARE: 'doggy_day_care',
    WALKING: 'walking'
};

const SCHEDULE_TYPES = { ONE_TIME: 'one_time', RECURRING: 'recurring' };
const PERIOD_ONLY_SERVICES = [SERVICE_TYPES.BOARDING, SERVICE_TYPES.HOUSE_SITTING];
const VISIT_SERVICES = [SERVICE_TYPES.DROP_IN_VISIT, SERVICE_TYPES.WALKING];
const DAY_CARE_SERVICE = SERVICE_TYPES.DOGGY_DAY_CARE;

const DURATIONS = [
    { id: '15m', label: '15 мин' },
    { id: '30m', label: '30 мин' },
    { id: '1h', label: '1 час' }
];

const TIMES = Array.from({ length: 17 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

const CreateOrder: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { activeServices, isConfigLoaded } = useSelector((state: RootState) => state.config);

    const defaultCountry = i18n.language === 'ru' ? 'ru' : 'us';

    const STEPS = [
        { id: 1, label: t('bookingScreen.steps.service', 'Услуга') },
        { id: 2, label: t('bookingScreen.steps.contacts', 'Контакты') },
        { id: 3, label: t('bookingScreen.steps.pets', 'Питомцы') }
    ];

    const WEEKDAYS = [
        { id: 1, label: 'Пн' },
        { id: 2, label: 'Вт' },
        { id: 3, label: 'Ср' },
        { id: 4, label: 'Чт' },
        { id: 5, label: 'Пт' },
        { id: 6, label: 'Сб' },
        { id: 0, label: 'Вс' }
    ];

    // --- ОПИСАНИЯ УСЛУГ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ---
    const SERVICE_DESCRIPTIONS: Record<string, string> = {
        [SERVICE_TYPES.BOARDING]: 'Ваш питомец живет в доме у ситтера. Домашняя обстановка, круглосуточный присмотр и забота.',
        [SERVICE_TYPES.HOUSE_SITTING]: 'Ситтер приезжает и живет в вашем доме. Идеально, если питомец боится новых мест.',
        [SERVICE_TYPES.DROP_IN_VISIT]: 'Ситтер приходит к вам домой (обычно на 15-30 минут), чтобы покормить, убрать лоток и поиграть.',
        [SERVICE_TYPES.DOGGY_DAY_CARE]: 'Дневной "детский сад". Вы привозите питомца утром к ситтеру и забираете вечером.',
        [SERVICE_TYPES.WALKING]: 'Активная прогулка на улице. Маршрут отслеживается по GPS, вы получите отчет с фото.'
    };


    // --- STATE ---
    const [currentStep, setCurrentStep] = useState(1);
    const [orderUuid, setOrderUuid] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Step 1
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [scheduleType, setScheduleType] = useState(SCHEDULE_TYPES.ONE_TIME);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [recurringStartDate, setRecurringStartDate] = useState('');
    const [recurringWeekdays, setRecurringWeekdays] = useState<number[]>([]);

    const [duration, setDuration] = useState<string | null>(null);
    const [visitsPerDay, setVisitsPerDay] = useState(1);
    const [visitTimes, setVisitTimes] = useState<Record<number, string>>({ 1: '' });

    // Step 2
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);

    // Step 3
    const [pets, setPets] = useState<any[]>([]);
    const [selectedPets, setSelectedPets] = useState<string[]>([]);
    const [isPetsLoading, setIsPetsLoading] = useState(true);

    // Promo
    const [promoCode, setPromoCode] = useState('');
    const [checkedPromo, setCheckedPromo] = useState<any>(null);
    const [promoError, setPromoError] = useState('');

    // --- COMPUTED ---
    const isPeriodOnly = useMemo(() => selectedService && PERIOD_ONLY_SERVICES.includes(selectedService), [selectedService]);
    const isVisit = useMemo(() => selectedService && VISIT_SERVICES.includes(selectedService), [selectedService]);
    const isDayCare = useMemo(() => selectedService === DAY_CARE_SERVICE, [selectedService]);
    const effectiveScheduleType = isPeriodOnly ? SCHEDULE_TYPES.ONE_TIME : scheduleType;

    const availableServicesList = useMemo(() => {
        const all = Object.values(SERVICE_TYPES);
        return (isConfigLoaded && Array.isArray(activeServices))
            ? all.filter(s => activeServices.includes(s))
            : all;
    }, [activeServices, isConfigLoaded]);

    // --- DYNAMIC TEXT GENERATOR ---
    const explanationText = useMemo(() => {
        if (!selectedService) return null;

        // Boarding / House Sitting
        if (isPeriodOnly) {
            if (!startDate || !endDate) return null;
            const start = moment(startDate).format('D MMMM');
            const end = moment(endDate).format('D MMMM');
            const nights = moment(endDate).diff(moment(startDate), 'days');
            const nightText = nights === 1 ? 'ночь' : (nights < 5 ? 'ночи' : 'ночей');
            return `Ситтер будет заботиться о питомце с ${start} по ${end} (всего ${nights} ${nightText}).`;
        }

        const times = Object.values(visitTimes).filter(Boolean).sort().join(', ');
        const durLabel = DURATIONS.find(d => d.id === duration)?.label || '';

        // Recurring (Visits / Walking / DayCare)
        if (scheduleType === SCHEDULE_TYPES.RECURRING) {
            if (!recurringStartDate || recurringWeekdays.length === 0) return null;
            const start = moment(recurringStartDate).format('D MMMM');

            const daysNames = recurringWeekdays
                .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b)) // Сортировка Пн-Вс
                .map(d => WEEKDAYS.find(w => w.id === d)?.label)
                .join(', ');

            if (isVisit) {
                if (!duration || !times) return null;
                return `Ситтер будет приходить по дням: ${daysNames}. Начиная с ${start}. ${visitsPerDay} раз(а) в день (${times}) на ${durLabel}. Заказ продлевается еженедельно, отмена в любой момент.`;
            }
            if (isDayCare) {
                if (!duration || !visitTimes[1]) return null;
                return `Вы привозите питомца по дням: ${daysNames}. Начиная с ${start}. Примерно в ${visitTimes[1]} на ${durLabel}.`;
            }
        }

        // One Time (Visits / Walking / DayCare)
        if (scheduleType === SCHEDULE_TYPES.ONE_TIME) {
            if (!startDate) return null;
            const start = moment(startDate).format('D MMMM');
            const end = endDate ? moment(endDate).format('D MMMM') : start;
            const dateStr = start === end ? start : `${start} - ${end}`;

            if (isVisit) {
                if (!duration || !times) return null;
                return `Ситтер придет ${dateStr}. ${visitsPerDay} раз(а) в день (${times}) на ${durLabel}.`;
            }
            if (isDayCare) {
                if (!duration || !visitTimes[1]) return null;
                return `Дневной присмотр ${dateStr}. Начало в ${visitTimes[1]}, длительность ${durLabel}.`;
            }
        }

        return null;
    }, [selectedService, scheduleType, startDate, endDate, recurringStartDate, recurringWeekdays, visitTimes, duration, visitsPerDay, isPeriodOnly, isVisit, isDayCare]);


    // --- EFFECTS ---
    useEffect(() => {
        setErrorMsg(null);
    }, [currentStep, selectedService, startDate, endDate, phone, address]);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const res = await getMyPets();
                let petsData = [];
                if (Array.isArray(res)) petsData = res;
                else if (res && Array.isArray(res.data)) petsData = res.data;
                setPets(petsData);
            } catch (e) {
                setPets([]);
            } finally {
                setIsPetsLoading(false);
            }
        };
        fetchPets();
    }, []);

    useEffect(() => {
        const uuidFromUrl = searchParams.get('uuid');
        if (uuidFromUrl) {
            setLoading(true);
            getOrderById(uuidFromUrl)
                .then((res) => {
                    const order = res.data;
                    if (!order) return;

                    setOrderUuid(order.id);
                    setSelectedService(order.service_type);
                    setScheduleType(order.schedule_type);

                    if (order.schedule_type === SCHEDULE_TYPES.RECURRING) {
                        setRecurringStartDate(order.start_date_local || '');
                        let days = order.recurring_days;
                        if (typeof days === 'string') { try { days = JSON.parse(days); } catch (e) { } }
                        if (Array.isArray(days)) setRecurringWeekdays(days);
                    } else {
                        setStartDate(order.start_date_local || '');
                        setEndDate(order.end_date_local || '');
                    }

                    if (order.duration_minutes) {
                        if (order.duration_minutes === 15) setDuration('15m');
                        if (order.duration_minutes === 30) setDuration('30m');
                        if (order.duration_minutes === 60) setDuration('1h');
                    }
                    if (order.visits_per_day) setVisitsPerDay(order.visits_per_day);
                    if (order.visit_times) {
                        let times = order.visit_times;
                        if (typeof times === 'string') { try { times = JSON.parse(times); } catch (e) { } }
                        setVisitTimes(times || {});
                    }

                    if (order.contact_phone) setPhone(order.contact_phone);
                    if (order.contact_name) setName(order.contact_name);
                    if (order.address) setAddress(order.address);

                    if (order.pets && Array.isArray(order.pets.data)) {
                        setSelectedPets(order.pets.data.map((p: any) => String(p.id)));
                    }

                    if (order.pets && order.pets.data && order.pets.data.length > 0) {
                        setCurrentStep(3);
                    } else if (order.address && order.contact_phone) {
                        setCurrentStep(3);
                    } else {
                        setCurrentStep(2);
                    }
                })
                .catch(e => console.error("Failed to load draft:", e))
                .finally(() => setLoading(false));
        }
    }, [searchParams]);

    // --- HELPERS ---

    const showError = (msg: string) => {
        setErrorMsg(msg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleVisitsChange = (count: number) => {
        setVisitsPerDay(count);
        setVisitTimes(prev => {
            const newTimes: Record<number, string> = {};
            for (let i = 1; i <= count; i++) {
                newTimes[i] = prev[i] || '';
            }
            return newTimes;
        });
    };

    const handleVisitTimeChange = (index: number, val: string) => {
        setVisitTimes(prev => ({ ...prev, [index]: val }));
    };

    const handleAddressInput = async (val: string) => {
        setAddress(val);
        if (val.length > 3) {
            try {
                const results = await fetchAddressSuggestions(val);
                setAddressSuggestions(results);
            } catch (e) { console.error(e); }
        } else {
            setAddressSuggestions([]);
        }
    };

    const handleAddressSelect = (val: string) => {
        setAddress(val);
        setAddressSuggestions([]);
    };

    // --- ACTIONS ---

    const nextStep1 = async () => {
        setErrorMsg(null);
        if (!selectedService) return showError('Пожалуйста, выберите услугу');

        // Валидация
        if (effectiveScheduleType === SCHEDULE_TYPES.RECURRING) {
            if (!recurringStartDate) return showError('Укажите дату начала');
            if (recurringWeekdays.length === 0) return showError('Выберите хотя бы один день недели');
        } else {
            if (!startDate) return showError('Выберите дату начала');
            if (isPeriodOnly && !endDate) return showError('Для этой услуги нужна дата окончания');
            if (endDate && moment(endDate).isBefore(startDate)) return showError('Дата окончания не может быть раньше начала');
        }

        if (isVisit || isDayCare) {
            if (!duration) return showError('Выберите длительность');
        }

        if (isVisit) {
            for (let i = 1; i <= visitsPerDay; i++) {
                if (!visitTimes[i]) return showError(`Укажите время для ${i}-го визита`);
            }
        }

        if (isDayCare && !visitTimes[1]) return showError('Укажите время начала');


        setLoading(true);
        try {
            const res = await createDraftOrder({
                service_type: selectedService!,
                schedule_type: effectiveScheduleType,
                start_date: effectiveScheduleType === SCHEDULE_TYPES.RECURRING ? recurringStartDate : startDate,
                end_date: effectiveScheduleType === SCHEDULE_TYPES.RECURRING ? null : (endDate || startDate),
                recurring_days: effectiveScheduleType === SCHEDULE_TYPES.RECURRING ? recurringWeekdays : null,
                duration: duration,
                visits_per_day: (isVisit || isDayCare) ? visitsPerDay : null,
                start_time: visitTimes[1] || null,
                // @ts-ignore
                visit_times: (isVisit) ? visitTimes : null,
            });

            if (res && res.data && res.data.id) {
                setOrderUuid(res.data.id);
                const newUrl = window.location.pathname + `?uuid=${res.data.id}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
                setCurrentStep(2);
            } else {
                showError('Ошибка при создании черновика');
            }
        } catch (e: any) {
            showError(e.response?.data?.message || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    const nextStep2 = async () => {
        setErrorMsg(null);
        if (!name) return showError('Введите ваше имя');
        if (!address) return showError('Введите адрес');
        if (address.trim().length < 5) return showError('Адрес слишком короткий');

        const cleanPhone = phone.replace(/[^\d]/g, '');
        if (!phone || cleanPhone.length < 11) {
            return showError('Пожалуйста, введите корректный номер телефона');
        }

        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

        setLoading(true);
        try {
            await updateOrderContact(orderUuid!, { phone: formattedPhone, name, address_q: address });
            setCurrentStep(3);
        } catch (e: any) {
            const serverData = e.response?.data;
            let alertMsg = serverData?.message || 'Ошибка сохранения';
            if (serverData?.errors) {
                const errorKeys = Object.keys(serverData.errors);
                if (errorKeys.length > 0) {
                    alertMsg = serverData.errors[errorKeys[0]][0];
                }
            }
            showError(alertMsg);
        } finally {
            setLoading(false);
        }
    };

    const finishOrder = async () => {
        setErrorMsg(null);
        if (selectedPets.length === 0) return showError('Выберите питомца');

        setLoading(true);
        try {
            await publishOrder(orderUuid!, {
                promo_code: checkedPromo?.code,
                pets: selectedPets
            });
            setIsSuccessModalOpen(true);
        } catch (e: any) {
            const serverData = e.response?.data;
            let alertMsg = serverData?.message || 'Ошибка публикации';
            if (serverData?.errors) {
                const errorKeys = Object.keys(serverData.errors);
                if (errorKeys.length > 0) {
                    alertMsg = serverData.errors[errorKeys[0]][0];
                }
            }
            showError(alertMsg);
        } finally {
            setLoading(false);
        }
    };

    const applyPromo = async () => {
        if (!promoCode) return;
        setPromoError('');
        try {
            const res = await checkPromoCodeAPI({ code: promoCode });
            setCheckedPromo(res.data);
        } catch (e) {
            setPromoError('Неверный промокод');
            setCheckedPromo(null);
        }
    };

    // --- RENDER HELPERS ---
    const getServiceIcon = (key: string) => {
        switch (key) {
            case SERVICE_TYPES.BOARDING: return BoardingIcon;
            case SERVICE_TYPES.HOUSE_SITTING: return HouseSittingIcon;
            case SERVICE_TYPES.DROP_IN_VISIT: return DropInVisitsIcon;
            case SERVICE_TYPES.DOGGY_DAY_CARE: return DoggyDayCareIcon;
            case SERVICE_TYPES.WALKING: return DogWalkingIcon;
            default: return BoardingIcon;
        }
    };

    const getBreedName = (breedData: any) => {
        if (!breedData) return 'Без породы';
        if (typeof breedData === 'string') return breedData;
        if (breedData.data && breedData.data.name) return breedData.data.name;
        return 'Без породы';
    };

    const getPetAvatarUrl = (pet: any) => {
        if (pet.avatar && pet.avatar.data && pet.avatar.data.preview_url) return pet.avatar.data.preview_url;
        if (pet.avatar && pet.avatar.data && pet.avatar.data.url) return pet.avatar.data.url;
        return null;
    };

    const summaryInfo = useMemo(() => {
        const defaultNames: Record<string, string> = {
            [SERVICE_TYPES.BOARDING]: 'Передержка',
            [SERVICE_TYPES.HOUSE_SITTING]: 'Няня (у вас дома)',
            [SERVICE_TYPES.DROP_IN_VISIT]: 'Визиты',
            [SERVICE_TYPES.DOGGY_DAY_CARE]: 'Дневной уход',
            [SERVICE_TYPES.WALKING]: 'Выгул'
        };

        const serviceName = selectedService
            ? t(`bookingScreen.serviceTypes.${selectedService}.name`, defaultNames[selectedService])
            : '-';

        let dateText = '-';
        if (effectiveScheduleType === SCHEDULE_TYPES.RECURRING) {
            dateText = `С ${moment(recurringStartDate).format('D MMM')} • ${recurringWeekdays.length} дн/нед`;
        } else if (startDate) {
            dateText = moment(startDate).format('D MMMM');
            if (endDate && endDate !== startDate) {
                dateText += ` - ${moment(endDate).format('D MMMM')}`;
            }
        }

        if (isVisit && visitsPerDay > 0) {
            const times = Object.values(visitTimes).filter(Boolean).join(', ');
            if (times) dateText += ` • ${times}`;
        }

        const petsNames = (pets || [])
            .filter(p => selectedPets.includes(String(p.id)))
            .map(p => p.name)
            .join(', ');

        return { serviceName, dateText, petsNames };
    }, [selectedService, startDate, endDate, recurringStartDate, recurringWeekdays, selectedPets, pets, effectiveScheduleType, t, visitTimes, isVisit, visitsPerDay]);

    const ErrorBanner = ({ msg }: { msg: string }) => (
        <div className={style.errorBanner}>
            <div className={style.errorIconWrapper}><AlertIcon /></div>
            <span className={style.errorTextContent}>{msg}</span>
        </div>
    );

    return (
        <div className={style.container}>
            <p className={style.pageSubtitle}>{t('bookingScreen.subtitle', 'Заполните простую форму, и мы подберем лучших ситтеров')}</p>

            <div className={style.stepperWrapper}>
                <div className={style.stepper}>
                    {STEPS.map((step) => (
                        <div key={step.id} className={`${style.stepItem} ${currentStep === step.id ? style.active : ''} ${currentStep > step.id ? style.completed : ''}`}>
                            <div className={style.stepCircle}>
                                {currentStep > step.id ? '✓' : step.id}
                            </div>
                            <span className={style.stepLabel}>{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={style.contentGrid}>
                {/* --- MAIN COLUMN --- */}
                <div className={style.mainColumn}>
                    {errorMsg && <ErrorBanner msg={errorMsg} />}

                    {/* ШАГ 1: УСЛУГА И ВРЕМЯ */}
                    {currentStep === 1 && (
                        <div className={style.card}>
                            <h2 className={style.cardTitle}>{t('bookingScreen.sections.service.title', '1. Какая услуга вам нужна?')}</h2>
                            <p className={style.sectionDesc}>{t('bookingScreen.sections.service.desc', 'Нажмите на карточку, чтобы выбрать')}</p>

                            <div className={style.servicesGrid}>
                                {availableServicesList.map(key => {
                                    const Icon = getServiceIcon(key);
                                    const defaultLabels: Record<string, string> = {
                                        [SERVICE_TYPES.BOARDING]: 'Передержка',
                                        [SERVICE_TYPES.HOUSE_SITTING]: 'Няня (у вас дома)',
                                        [SERVICE_TYPES.DROP_IN_VISIT]: 'Визиты',
                                        [SERVICE_TYPES.DOGGY_DAY_CARE]: 'Дневной уход',
                                        [SERVICE_TYPES.WALKING]: 'Выгул собак'
                                    };

                                    return (
                                        <div
                                            key={key}
                                            className={`${style.serviceItem} ${selectedService === key ? style.selected : ''}`}
                                            onClick={() => setSelectedService(key)}
                                        >
                                            <div className={style.serviceHeader}>
                                                <div className={style.serviceIcon}><Icon width={24} height={24} /></div>
                                                <span className={style.serviceName}>{t(`bookingScreen.serviceTypes.${key}.name`, defaultLabels[key])}</span>
                                            </div>
                                            <span className={style.serviceDescription}>{SERVICE_DESCRIPTIONS[key]}</span>
                                            {selectedService === key && <div className={style.checkMark}>✓</div>}
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedService && (
                                <div className={style.scheduleSection}>
                                    <h2 className={style.cardTitle}>{t('bookingScreen.sections.schedule.title', 'Когда нужна помощь?')}</h2>

                                    {!isPeriodOnly && (
                                        <div className={style.tabsWrapper}>
                                            <div className={style.tabs}>
                                                <button className={`${style.tab} ${scheduleType === SCHEDULE_TYPES.ONE_TIME ? style.active : ''}`} onClick={() => setScheduleType(SCHEDULE_TYPES.ONE_TIME)}>
                                                    Разово
                                                </button>
                                                <button className={`${style.tab} ${scheduleType === SCHEDULE_TYPES.RECURRING ? style.active : ''}`} onClick={() => setScheduleType(SCHEDULE_TYPES.RECURRING)}>
                                                    Регулярно
                                                </button>
                                            </div>
                                            <p className={style.helperText}>
                                                {scheduleType === SCHEDULE_TYPES.ONE_TIME
                                                    ? 'Для отпуска или командировки. Ситтер выполнит услугу в указанные даты.'
                                                    : 'Для постоянной помощи (например, выгул 3 раза в неделю). Заказ продлевается автоматически.'}
                                            </p>
                                        </div>
                                    )}

                                    {/* ГРУППИРОВКА ДАТ В ОДИН РЯД */}
                                    <div className={style.dateInputs}>
                                        {effectiveScheduleType === SCHEDULE_TYPES.RECURRING ? (
                                            <div className={style.formGroup}>
                                                <label>С какого числа начать? <span>*</span></label>
                                                <input type="date" className={style.input} value={recurringStartDate} min={moment().format('YYYY-MM-DD')} onChange={e => setRecurringStartDate(e.target.value)} />
                                            </div>
                                        ) : (
                                            <>
                                                <div className={style.formGroup}>
                                                    <label>Дата начала <span>*</span></label>
                                                    <input type="date" className={style.input} value={startDate} min={moment().format('YYYY-MM-DD')} onChange={e => setStartDate(e.target.value)} />
                                                </div>
                                                <div className={style.formGroup}>
                                                    <label>Дата окончания {isPeriodOnly && <span>*</span>}</label>
                                                    <input type="date" className={style.input} value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {effectiveScheduleType === SCHEDULE_TYPES.RECURRING && (
                                        <div className={style.formGroup}>
                                            <label>По каким дням? <span>*</span></label>
                                            <div className={style.chipsRow}>
                                                {WEEKDAYS.map(day => (
                                                    <button
                                                        key={day.id}
                                                        className={`${style.chip} ${recurringWeekdays.includes(day.id) ? style.selected : ''}`}
                                                        onClick={() => setRecurringWeekdays(prev => prev.includes(day.id) ? prev.filter(d => d !== day.id) : [...prev, day.id])}
                                                    >
                                                        {day.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(isVisit || isDayCare) && (
                                        <div className={style.formGroup}>
                                            <label>Длительность <span>*</span></label>
                                            <div className={style.chipsRow}>
                                                {DURATIONS.map(d => (
                                                    <button key={d.id} className={`${style.chip} ${duration === d.id ? style.selected : ''}`} onClick={() => setDuration(d.id)}>{d.label}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isVisit && (
                                        <div className={style.visitsSection}>
                                            <div className={style.formGroup}>
                                                <label>Раз в день</label>
                                                <div className={style.visitCountRow}>
                                                    {[1, 2, 3].map(count => (
                                                        <button key={count} className={`${style.visitCountBtn} ${visitsPerDay === count ? style.active : ''}`} onClick={() => handleVisitsChange(count)}>{count}</button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className={style.timeSlotsGrid}>
                                                {Array.from({ length: visitsPerDay }).map((_, i) => {
                                                    const visitNum = i + 1;
                                                    return (
                                                        <div key={visitNum} className={style.formGroup}>
                                                            <label>{visitNum}-й визит в <span>*</span></label>
                                                            <div className={style.selectWrapper}>
                                                                <select
                                                                    className={style.input}
                                                                    value={visitTimes[visitNum] || ''}
                                                                    onChange={e => handleVisitTimeChange(visitNum, e.target.value)}
                                                                >
                                                                    <option value="">-- : --</option>
                                                                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                                                                </select>
                                                                <div className={style.chevronIcon}><ChevronDownIcon /></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {isDayCare && (
                                        <div className={style.formGroup}>
                                            <label>Время начала <span>*</span></label>
                                            <div className={style.selectWrapper} style={{ maxWidth: 220 }}>
                                                <select className={style.input} value={visitTimes[1] || ''} onChange={e => setVisitTimes({ 1: e.target.value })}>
                                                    <option value="">-- Выбрать --</option>
                                                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                <div className={style.chevronIcon}><ChevronDownIcon /></div>
                                            </div>
                                        </div>
                                    )}

                                    {explanationText && (
                                        <div className={style.scheduleExplanation}>
                                            <InfoIcon />
                                            <div>
                                                <strong>Итог:</strong> {explanationText}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={style.actionsBar}>
                                <div />
                                <button className={style.nextBtn} onClick={nextStep1} disabled={loading || !selectedService}>
                                    {loading ? t('common.loading', 'Создаем...') : t('common.continue', 'Продолжить →')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ШАГ 2: КОНТАКТЫ */}
                    {currentStep === 2 && (
                        <div className={style.card}>
                            <h2 className={style.cardTitle}>{t('bookingScreen.sections.contacts.title', '2. Ваши контакты и адрес')}</h2>
                            <p className={style.sectionDesc}>{t('bookingScreen.sections.contacts.desc', 'Чтобы исполнитель знал, куда ехать и как с вами связаться')}</p>

                            <div className={style.rowInputs}>
                                <div className={style.formGroup}>
                                    <label>{t('bookingScreen.labels.name', 'Как к вам обращаться?')}</label>
                                    <input
                                        className={style.input}
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Имя"
                                    />
                                </div>

                                <div className={style.formGroup}>
                                    <label>{t('bookingScreen.labels.phone', 'Мобильный телефон')}</label>
                                    <div className={style.phoneWrapper}>
                                        <PhoneInput
                                            country={defaultCountry}
                                            value={phone}
                                            onChange={(phone) => { setPhone(phone); setErrorMsg(null); }}
                                            inputClass={style.phoneInput}
                                            buttonClass={style.phoneButton}
                                            dropdownClass={style.phoneDropdown}
                                            containerClass={style.phoneContainer}
                                            enableSearch={true}
                                            disableSearchIcon={true}
                                            preferredCountries={['ru', 'kz', 'by', 'us', 'de', 'ge', 'am']}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={style.formGroup}>
                                <label>{t('bookingScreen.labels.address', 'Где будет проходить услуга? (Адрес)')}</label>
                                {/* Перемещаем список подсказок внутрь relative контейнера */}
                                <div className={style.inputWithIcon}>
                                    <input
                                        className={style.input}
                                        value={address}
                                        onChange={e => handleAddressInput(e.target.value)}
                                        placeholder="Начните вводить адрес..."
                                        autoComplete="off"
                                    />
                                    {addressSuggestions.length > 0 && (
                                        <ul className={style.suggestionsList}>
                                            {addressSuggestions.map((addr, idx) => (
                                                <li key={idx} onClick={() => handleAddressSelect(addr)}>{addr}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className={style.actionsBar}>
                                <button className={style.nextBtn} onClick={nextStep2} disabled={loading}>
                                    {loading ? t('common.saving', 'Сохраняем...') : t('common.continue', 'Продолжить →')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ШАГ 3: ПИТОМЦЫ + ФИНИШ */}
                    {currentStep === 3 && (
                        <div className={style.card}>
                            <h2 className={style.cardTitle}>{t('bookingScreen.sections.pets.title', '3. Кто ваш питомец?')}</h2>
                            <p className={style.sectionDesc}>{t('bookingScreen.sections.pets.desc', 'Выберите одного или нескольких питомцев для этой услуги')}</p>

                            {isPetsLoading ? (
                                <div className={style.loader}>{t('common.loadingList', 'Загружаем список...')}</div>
                            ) : (!pets || pets.length === 0) ? (
                                <div className={style.emptyState}>
                                    <p>{t('bookingScreen.noPets', 'У вас пока нет добавленных питомцев.')}</p>
                                    <button
                                        className={style.addPetBigBtn}
                                        onClick={() => navigate('/cabinet/pets/add', {
                                            state: { returnToOrderUuid: orderUuid }
                                        })}
                                    >
                                        {t('bookingScreen.addPet', '+ Добавить питомца')}
                                    </button>
                                </div>
                            ) : (
                                <div className={style.petsGrid}>
                                    {pets.map(pet => {
                                        const petIdStr = String(pet.id);
                                        const isSelected = selectedPets.includes(petIdStr);
                                        const avatarUrl = getPetAvatarUrl(pet);

                                        return (
                                            <div
                                                key={pet.id}
                                                className={`${style.petCard} ${isSelected ? style.selected : ''}`}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedPets(prev => prev.filter(id => id !== petIdStr));
                                                    } else {
                                                        setSelectedPets(prev => [...prev, petIdStr]);
                                                    }
                                                }}
                                            >
                                                <div className={style.checkboxCircle}>
                                                    {isSelected && '✓'}
                                                </div>
                                                <div className={style.petAvatar}>
                                                    {avatarUrl ? <img src={avatarUrl} alt={pet.name} /> : <PawIcon />}
                                                </div>
                                                <span className={style.petName}>{pet.name}</span>
                                                <span className={style.petBreed}>{getBreedName(pet.breed)}</span>
                                            </div>
                                        );
                                    })}
                                    <div
                                        className={`${style.petCard} ${style.addNewPetCard}`}
                                        onClick={() => navigate('/cabinet/pets/add', {
                                            state: { returnToOrderUuid: orderUuid }
                                        })}
                                    >
                                        <div className={style.petAvatar}>+</div>
                                        <span className={style.petName}>{t('common.add', 'Добавить')}</span>
                                    </div>
                                </div>
                            )}

                            {/* --- БЛОК ПРОМОКОДА --- */}
                            <div className={style.formGroup} style={{ marginTop: 24, borderTop: '1px solid #EDF2F7', paddingTop: 16 }}>
                                <label>{t('bookingScreen.labels.promo', 'Есть промокод?')}</label>
                                <div className={style.promoRow}>
                                    <input
                                        className={style.input}
                                        value={promoCode}
                                        onChange={e => { setPromoCode(e.target.value.toUpperCase()); setCheckedPromo(null); setPromoError(''); }}
                                        placeholder="Введите код"
                                        disabled={!!checkedPromo}
                                    />
                                    {checkedPromo ? (
                                        <button className={style.btnDanger} onClick={() => { setCheckedPromo(null); setPromoCode(''); }}>✖</button>
                                    ) : (
                                        <button className={style.btnSecondary} onClick={applyPromo} disabled={!promoCode}>{t('common.apply', 'Применить')}</button>
                                    )}
                                </div>
                                {checkedPromo && (
                                    <p className={style.successText}>
                                        {checkedPromo.display_text ? `✓ ${checkedPromo.display_text}` : t('bookingScreen.promoSuccess', '✓ Скидка применена!')}
                                    </p>
                                )}
                                {promoError && <p className={style.errorText}>{promoError}</p>}
                            </div>

                            {/* --- ФИНАЛЬНЫЕ КНОПКИ --- */}
                            <div className={style.finalAction}>
                                <button className={style.btnPrimary} onClick={finishOrder} disabled={loading || selectedPets.length === 0}>
                                    {loading ? t('common.publishing', 'Публикация...') : t('bookingScreen.buttons.publish', 'Разместить заказ бесплатно')}
                                </button>
                            </div>
                            <p className={style.disclaimerSmall}>{t('bookingScreen.disclaimer', 'Вы пока ничего не платите. Оплата только после того, как вы выберете исполнителя и подтвердите бронирование.')}</p>
                        </div>
                    )}
                </div>

                {/* --- SIDEBAR --- */}
                <div className={style.sidebar}>
                    <div className={style.summaryCard}>
                        <h3 className={style.summaryTitle}>{t('bookingScreen.summary.title', 'Ваш заказ')}</h3>
                        <div className={style.summaryDivider} />

                        <div className={style.summaryItem}>
                            <span className={style.lbl}>{t('bookingScreen.summary.service', 'Услуга:')}</span>
                            <span className={style.val}>{summaryInfo.serviceName}</span>
                        </div>
                        <div className={style.summaryItem}>
                            <span className={style.lbl}>{t('bookingScreen.summary.when', 'Когда:')}</span>
                            <span className={style.val}>{summaryInfo.dateText}</span>
                        </div>
                        <div className={style.summaryItem}>
                            <span className={style.lbl}>{t('bookingScreen.summary.where', 'Где:')}</span>
                            <span className={style.val}>{address || <span style={{ color: '#aaa' }}>{t('common.notSpecified', 'Не указано')}</span>}</span>
                        </div>
                        <div className={style.summaryItem}>
                            <span className={style.lbl}>{t('bookingScreen.summary.who', 'Кто:')}</span>
                            <span className={style.val}>{summaryInfo.petsNames || <span style={{ color: '#aaa' }}>{t('common.notSelected', 'Не выбрано')}</span>}</span>
                        </div>
                    </div>

                    <div className={style.infoCard}>
                        <h3 className={style.infoTitle}>{t('bookingScreen.howItWorks.title', 'Как это работает?')}</h3>
                        <ul className={style.stepsList}>
                            <li>
                                <span className={style.stepNum}>1</span>
                                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                                    <strong>Создайте заявку</strong>
                                    <span style={{ color: '#666', marginTop: '2px' }}>Это бесплатно. Вашу заявку увидят проверенные ситтеры.</span>
                                </div>
                            </li>
                            <li>
                                <span className={style.stepNum}>2</span>
                                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                                    <strong>Получите отклики</strong>
                                    <span style={{ color: '#666', marginTop: '2px' }}>Ситтеры сами напишут вам и предложат свои услуги.</span>
                                </div>
                            </li>
                            <li>
                                <span className={style.stepNum}>3</span>
                                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                                    <strong>Выберите лучшего</strong>
                                    <span style={{ color: '#666', marginTop: '2px' }}>Деньги спишутся только после вашего согласия.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* MODAL SUCCESS */}
            <OrderCreatedModal
                isOpen={isSuccessModalOpen}
                onClose={() => navigate('/cabinet/orders')}
            />
        </div>
    );
};

export default CreateOrder;