import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWorkerAvailableServices, createWorkerRequestSetting, getWorkerStatus } from '../../../../services/api';
import style from '../../../../style/pages/cabinet/becomeSitter/StepServices.module.scss';
import StepTests from './StepTests';
import ServiceConfigurationCard from './ServiceConfigurationCard';

// --- Константы ---
const SERVICE_KEYS = {
    BOARDING: 'boarding',
    HOUSE_SITTING: 'house_sitting',
    DROP_IN_VISIT: 'drop_in_visit',
    DAY_CARE: 'doggy_day_care',
    WALKING: 'walking',
};

const DEFAULT_UNITS_MAP: Record<string, string> = {
    [SERVICE_KEYS.BOARDING]: 'night',
    [SERVICE_KEYS.HOUSE_SITTING]: 'night',
    [SERVICE_KEYS.DAY_CARE]: 'day',
    [SERVICE_KEYS.DROP_IN_VISIT]: 'visit',
    [SERVICE_KEYS.WALKING]: 'walk_60',
};

// Иконки для хедера
const PriceTagsIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const SchoolIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>;

const StepServices = ({ onNext }: { onNext: () => void }) => {
    const { t } = useTranslation();

    const [workerServices, setWorkerServices] = useState<any>({});
    const [availableKeys, setAvailableKeys] = useState<string[]>([]);
    const [currencySymbol, setCurrencySymbol] = useState('₽');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showTests, setShowTests] = useState(false);

    // --- ИСПРАВЛЕНИЕ ПЕРЕВОДОВ ---
    const getServiceName = (key: string) => {
        // Маппинг ключей из БД (snake_case) в ключи i18n (camelCase)
        const map: Record<string, string> = {
            [SERVICE_KEYS.BOARDING]: 'boarding',
            [SERVICE_KEYS.WALKING]: 'walking',
            [SERVICE_KEYS.DAY_CARE]: 'daycare',     // doggy_day_care -> daycare
            [SERVICE_KEYS.DROP_IN_VISIT]: 'dropIn', // drop_in_visit -> dropIn
            [SERVICE_KEYS.HOUSE_SITTING]: 'houseSitting'
        };
        const transKey = map[key] || key;
        return t(`header.services.${transKey}`, key) as string;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [availableServicesResponse, statusResponse] = await Promise.all([
                    getWorkerAvailableServices(),
                    getWorkerStatus()
                ]);

                let appData: any = null;
                let savedUserConfigurations: any[] = [];

                if (statusResponse?.application_data?.data) {
                    appData = statusResponse.application_data.data;
                    savedUserConfigurations = appData?.initial_service_configurations?.data || [];

                    const userCurrencySymbol = statusResponse.application_data.data.user?.data?.currency_symbol;
                    const cityCurrency = appData?.selected_city?.data?.currency;
                    if (userCurrencySymbol) setCurrencySymbol(userCurrencySymbol);
                    else if (cityCurrency === 'RUB') setCurrencySymbol('₽');
                    else if (cityCurrency === 'USD') setCurrencySymbol('$');
                }

                const keys: string[] = [];

                if (!appData) {
                    keys.push(SERVICE_KEYS.BOARDING, SERVICE_KEYS.WALKING);
                } else {
                    if (appData.is_sitter_applicant) {
                        keys.push(SERVICE_KEYS.BOARDING, SERVICE_KEYS.HOUSE_SITTING, SERVICE_KEYS.DROP_IN_VISIT, SERVICE_KEYS.DAY_CARE);
                    }
                    if (appData.is_walker_applicant) {
                        keys.push(SERVICE_KEYS.WALKING);
                    }
                }

                const servicesInfoFromApi = availableServicesResponse.data || [];
                const activeApiKeys = servicesInfoFromApi.map((s: any) => s.service_key);
                const allowedKeys = keys.filter(key => activeApiKeys.includes(key));

                const order = [
                    SERVICE_KEYS.BOARDING,
                    SERVICE_KEYS.WALKING,
                    SERVICE_KEYS.DAY_CARE,
                    SERVICE_KEYS.HOUSE_SITTING,
                    SERVICE_KEYS.DROP_IN_VISIT
                ];
                const sortedKeys = [...new Set(allowedKeys)].sort((a, b) => order.indexOf(a) - order.indexOf(b));
                setAvailableKeys(sortedKeys);

                const initialSettings: any = {};

                sortedKeys.forEach(serviceKey => {
                    const serviceAbilityInfo = servicesInfoFromApi.find((s: any) => s.service_key === serviceKey);
                    const userSavedConfig = savedUserConfigurations.find((s: any) => s.service_key === serviceKey);

                    if (!serviceAbilityInfo) return;

                    const testDetails = serviceAbilityInfo.test_details_for_activation || { status: 'not_defined', message: 'Test not defined' };
                    const canActivateBasedOnTest =
                        testDetails.status === 'required_passed' ||
                        testDetails.status === 'completed_passed' ||
                        testDetails.status === 'not_required';

                    let initialIsActive = false;
                    if (userSavedConfig && typeof userSavedConfig.is_active !== 'undefined') {
                        initialIsActive = !!userSavedConfig.is_active;
                    }

                    let priceToSet = userSavedConfig?.price_per_unit?.toString();
                    if (priceToSet === undefined || priceToSet === null || priceToSet === '') {
                        priceToSet = serviceAbilityInfo.recommended_price !== null && typeof serviceAbilityInfo.recommended_price !== 'undefined'
                            ? serviceAbilityInfo.recommended_price.toString()
                            : '';
                    }

                    initialSettings[serviceKey] = {
                        service_key: serviceKey,
                        price_per_unit: priceToSet,
                        unit: userSavedConfig?.unit || serviceAbilityInfo.default_unit || DEFAULT_UNITS_MAP[serviceKey] || '',
                        is_active: initialIsActive,
                        price_per_additional_pet: userSavedConfig?.price_per_additional_pet?.toString() ?? '',
                        max_pets: userSavedConfig?.max_pets?.toString() ?? '',
                        allowed_pet_types: userSavedConfig?.allowed_pet_types?.length ? userSavedConfig.allowed_pet_types : [],
                        allowed_dog_sizes: userSavedConfig?.allowed_dog_sizes?.length ? userSavedConfig.allowed_dog_sizes : [],
                        allowed_cat_sizes: userSavedConfig?.allowed_cat_sizes?.length ? userSavedConfig.allowed_cat_sizes : [],
                        can_be_activated_from_api: canActivateBasedOnTest,
                        test_details_from_api: testDetails,
                        recommended_price_from_api: serviceAbilityInfo.recommended_price ?? null,
                        default_unit_from_api: serviceAbilityInfo.default_unit || DEFAULT_UNITS_MAP[serviceKey] || '',
                    };

                    // Дефолтные значения для новой настройки
                    if (!userSavedConfig) {
                        if (serviceKey === SERVICE_KEYS.WALKING) {
                            initialSettings[serviceKey].allowed_dog_sizes = [1, 2, 3, 4, 5];
                        } else {
                            initialSettings[serviceKey].allowed_pet_types = [1, 2];
                            initialSettings[serviceKey].allowed_dog_sizes = [1, 2, 3, 4, 5];
                            initialSettings[serviceKey].allowed_cat_sizes = [1, 2, 3, 4, 5];
                        }
                    }
                });

                setWorkerServices(initialSettings);

            } catch (error) {
                console.error(error);
                alert(t('ErrorSomethingWentWrong', 'Произошла ошибка при загрузке данных') as string);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [t]);

    const handleSettingChange = (serviceKey: string, field: string, value: string) => {
        let sanitizedValue = value;
        if (field === 'price_per_unit' || field === 'price_per_additional_pet') {
            sanitizedValue = value.replace(/[^0-9.]/g, '');
        } else if (field === 'max_pets') {
            sanitizedValue = value.replace(/[^0-9]/g, '');
        }

        setWorkerServices((prev: any) => ({
            ...prev,
            [serviceKey]: { ...(prev[serviceKey] || {}), [field]: sanitizedValue }
        }));
    };

    const handleToggleActive = (serviceKey: string) => {
        setWorkerServices((prev: any) => {
            const current = prev[serviceKey];
            if (!current) return prev;
            // Просто переключаем. Проверка теста теперь внутри карточки.
            return { ...prev, [serviceKey]: { ...current, is_active: !current.is_active } };
        });
    };

    const handleMultiSelectChange = (serviceKey: string, field: string, newValue: any[]) => {
        setWorkerServices((prev: any) => ({
            ...prev,
            [serviceKey]: { ...(prev[serviceKey] || {}), [field]: newValue }
        }));
    };

    const handleNext = async () => {
        const servicesPayload: any[] = [];
        let isValid = true;
        let firstErrorMessage = '';

        for (const key of availableKeys) {
            if (!isValid) break;
            const settings = workerServices[key];
            if (!settings) continue;

            const testAllows = settings.can_be_activated_from_api;
            const finalIsActive = !!settings.is_active;
            const serviceName = getServiceName(key);

            const allowedPetTypes = finalIsActive ? [...new Set(settings.allowed_pet_types || [])] : [];
            const allowedDogSizes = finalIsActive ? [...new Set(settings.allowed_dog_sizes || [])] : [];
            const allowedCatSizes = finalIsActive ? [...new Set(settings.allowed_cat_sizes || [])] : [];

            const payloadEntry = {
                service_key: key,
                price_per_unit: parseFloat(settings.price_per_unit?.toString().replace(',', '.')) || 0,
                unit: settings.unit || settings.default_unit_from_api || DEFAULT_UNITS_MAP[key] || '',
                is_active: finalIsActive,
                price_per_additional_pet: (settings.price_per_additional_pet) ? parseFloat(settings.price_per_additional_pet?.toString().replace(',', '.')) : null,
                max_pets: key === SERVICE_KEYS.WALKING ? 1 : (settings.max_pets ? parseInt(settings.max_pets, 10) : null),
                allowed_pet_types: allowedPetTypes,
                allowed_dog_sizes: allowedDogSizes,
                allowed_cat_sizes: allowedCatSizes,
            };
            servicesPayload.push(payloadEntry);

            if (settings.is_active) {
                // Если услуга активна, но тест не сдан - не даем сохранить
                if (!testAllows) {
                    firstErrorMessage = `${t('TestRequiredForActivation', 'Требуется сдать тест для') as string}: ${serviceName}`;
                    isValid = false;
                    continue;
                }
                const price = parseFloat(settings.price_per_unit?.toString().replace(',', '.'));
                if (!settings.price_per_unit || isNaN(price) || price <= 0) {
                    firstErrorMessage = `${t('ErrorEnterValidPositivePriceFor', 'Введите корректную цену для') as string} ${serviceName}`;
                    isValid = false; continue;
                }
                const isDogWalking = key === SERVICE_KEYS.WALKING;
                if (isDogWalking && payloadEntry.allowed_dog_sizes.length === 0) {
                    firstErrorMessage = t('ErrorSelectDogSizeForWalker', 'Выберите размер собак для выгула') as string;
                    isValid = false; continue;
                }
                if (!isDogWalking && payloadEntry.allowed_pet_types.length === 0) {
                    firstErrorMessage = `${t('ErrorSelectPetTypeFor', 'Выберите тип питомца для') as string} ${serviceName}`;
                    isValid = false; continue;
                }
            }
        }

        if (!isValid) {
            alert(firstErrorMessage);
            return;
        }

        // Если все услуги выключены
        const hasAtLeastOneActive = servicesPayload.some((s: any) => s.is_active);
        const anyCanActivate = availableKeys.some(key => workerServices[key]?.can_be_activated_from_api);

        if (!hasAtLeastOneActive && anyCanActivate) {
            if (!window.confirm(t('WarningNoServicesActive', 'Вы не активировали ни одной услуги. Продолжить?') as string)) {
                return;
            }
        }

        setSaving(true);
        try {
            const response = await createWorkerRequestSetting({ services: servicesPayload });
            if (response?.status === 'success' || response?.object === 'workerrequests' || response?.data?.object === 'workerrequests') {
                onNext();
            } else {
                alert(response?.message || t('ErrorSubmissionFailed', 'Ошибка сохранения') as string);
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || t('ErrorSomethingWentWrong', 'Что-то пошло не так') as string;
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    if (showTests) {
        return <StepTests onNext={() => { setShowTests(false); }} />;
    }

    if (loading) {
        return <div className={style.centerLoader}>{t('LoadingSettings...', 'Загрузка настроек...') as string}</div>;
    }

    return (
        <div className={style.wizardContainer}>
            <div className={style.headerBlock}>
                <div className={style.iconCircle}>
                    <PriceTagsIcon />
                </div>
                <h2 className={style.title}>{t('Step3ServiceSettingsTitle', 'Настройка услуг') as string}</h2>
                <p className={style.subtitle}>{t('Step3ServiceSettingsDescription', 'Выберите услуги, которые вы готовы оказывать, и установите свои цены.') as string}</p>

                <button className={style.testsBtn} onClick={() => setShowTests(true)}>
                    <SchoolIcon /> {t('GoToTestsButton', 'Пройти тесты') as string}
                </button>
            </div>

            <div className={style.servicesList}>
                {availableKeys.map((key) => (
                    <ServiceConfigurationCard
                        key={key}
                        serviceKey={key}
                        serviceName={getServiceName(key)}
                        settings={workerServices[key]}
                        currencySymbol={currencySymbol}
                        onToggleActive={handleToggleActive}
                        onChangeSetting={handleSettingChange}
                        onMultiSelectChange={handleMultiSelectChange}
                        onGoToTests={() => setShowTests(true)}
                    />
                ))}
            </div>

            <button
                className={style.btnPrimary}
                onClick={handleNext}
                disabled={saving || loading}
            >
                {saving ? t('Saving...', 'Сохранение...') as string : t('NextButton', 'Далее') as string}
            </button>
        </div>
    );
};

export default StepServices;