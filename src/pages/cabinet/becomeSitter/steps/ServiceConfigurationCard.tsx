import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import style from '../../../../style/pages/cabinet/becomeSitter/StepServices.module.scss';

// --- Импорт существующих иконок проекта ---
import BoardingIcon from '../../../../components/icons/BoardingIcon';
import DogWalkingIcon from '../../../../components/icons/DogWalkingIcon';
import DropInVisitsIcon from '../../../../components/icons/DropInVisitsIcon';
import DoggyDayCareIcon from '../../../../components/icons/DoggyDayCareIcon';
import HouseSittingIcon from '../../../../components/icons/HouseSittingIcon';

// Вспомогательные иконки (оставляем SVG, если для них нет компонентов в проекте)
const Icons = {
    Warning: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
    TrendingUp: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
    ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
};

const SERVICE_KEYS = {
    BOARDING: 'boarding',
    HOUSE_SITTING: 'house_sitting',
    DROP_IN: 'drop_in_visit',
    DAY_CARE: 'doggy_day_care',
    WALKING: 'walking',
};

const UNITS = {
    NIGHT: 'night', VISIT: 'visit', WALK_30: 'walk_30',
    WALK_60: 'walk_60', DAY: 'day',
};

// --- Helper Components ---
const SelectOption = ({ label, options, value, onChange, isMultiSelect, showDescription }: any) => {
    const handleSelect = (id: number) => {
        if (isMultiSelect) {
            const current = value || [];
            if (current.includes(id)) {
                onChange(current.filter((i: number) => i !== id));
            } else {
                onChange([...current, id]);
            }
        } else {
            onChange(id);
        }
    };

    return (
        <div className={style.selectOptionContainer}>
            <label className={style.inputLabel}>{label}</label>
            <div className={style.chipsWrapper}>
                {options.map((opt: any) => {
                    const isSelected = isMultiSelect ? value?.includes(opt.value) : value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            className={`${style.chip} ${isSelected ? style.selected : ''}`}
                            onClick={() => handleSelect(opt.value)}
                        >
                            <span className={style.chipLabel}>{opt.label}</span>
                            {showDescription && opt.description && (
                                <span className={style.chipDesc}>{opt.description}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const ServiceConfigurationCard = ({
    serviceKey,
    serviceName,
    settings,
    currencySymbol,
    onToggleActive,
    onChangeSetting,
    onMultiSelectChange,
    onGoToTests
}: any) => {
    const { t } = useTranslation();

    if (!settings) return null;

    // --- Логика статусов ---
    // Данные для рендера
    const isActive = !!settings.is_active; // Включен ли свитч пользователем
    const testAllows = settings.can_be_activated_from_api; // Разрешает ли API (пройден ли тест)

    // Свитч визуально включен ТОЛЬКО если пользователь включил И тест позволяет
    // (Или если это режим редактирования черновика, где тест еще не пройден, но пользователь пытается включить - обрабатываем ниже)
    const isSwitchOn = isActive;

    const testDetails = settings.test_details_from_api || {};

    // Показывать плашку "Требуется тест", если тест НЕ пройден и НЕ является "не требуемым"
    const showTestWarning =
        testDetails.status !== 'required_passed' &&
        testDetails.status !== 'completed_passed' &&
        testDetails.status !== 'not_required';

    const isDogWalking = serviceKey === SERVICE_KEYS.WALKING;

    // --- Выбор иконки ---
    const renderServiceIcon = () => {
        const props = { width: 24, height: 24, className: style.serviceIconSvg };
        switch (serviceKey) {
            case SERVICE_KEYS.BOARDING: return <BoardingIcon {...props} />;
            case SERVICE_KEYS.WALKING: return <DogWalkingIcon {...props} />;
            case SERVICE_KEYS.DROP_IN: return <DropInVisitsIcon {...props} />;
            case SERVICE_KEYS.DAY_CARE: return <DoggyDayCareIcon {...props} />;
            case SERVICE_KEYS.HOUSE_SITTING: return <HouseSittingIcon {...props} />;
            default: return <BoardingIcon {...props} />;
        }
    };

    // Локализация юнитов
    const getUnitName = (unitKey: string) => {
        if (serviceKey === SERVICE_KEYS.WALKING) {
            if (unitKey === UNITS.WALK_30) return t('for_30_min_walk', '30 мин');
            if (unitKey === UNITS.WALK_60) return t('for_60_min_walk', '60 мин');
        }
        const map: any = {
            [UNITS.NIGHT]: t('per_night', 'за ночь'),
            [UNITS.VISIT]: t('per_visit', 'за визит'),
            [UNITS.DAY]: t('per_day', 'за день'),
        };
        return map[unitKey] || unitKey;
    };

    const currentUnitForDisplay = settings.unit || settings.default_unit_from_api || '';

    // Списки опций
    const ALL_PET_TYPES = [
        { value: 1, label: t('petTypes.dog', 'Собаки') },
        { value: 2, label: t('petTypes.cat', 'Кошки') }
    ];

    const ALL_PET_SIZES = [
        { value: 1, label: t('petSizes.mini.name', 'Мини'), description: t('petSizes.mini.description', '<5кг') },
        { value: 2, label: t('petSizes.small.name', 'Мелкая'), description: t('petSizes.small.description', '5-10кг') },
        { value: 3, label: t('petSizes.medium.name', 'Средняя'), description: t('petSizes.medium.description', '10-20кг') },
        { value: 4, label: t('petSizes.big.name', 'Крупная'), description: t('petSizes.big.description', '20-40кг') },
        { value: 5, label: t('petSizes.huge.name', 'Гигант'), description: t('petSizes.huge.description', '40+кг') },
    ];

    const walkDurationOptions = [
        { label: getUnitName(UNITS.WALK_30), value: UNITS.WALK_30 },
        { label: getUnitName(UNITS.WALK_60), value: UNITS.WALK_60 },
    ];

    // Visibility logic
    const petTypesSelected = settings.allowed_pet_types || [];
    const showDogSizes = isDogWalking || petTypesSelected.includes(1);
    const showCatSizes = !isDogWalking && petTypesSelected.includes(2);

    return (
        <div className={`${style.card} ${isSwitchOn ? style.cardActive : ''}`}>
            {/* --- Header --- */}
            <div className={style.header}>
                <div className={style.headerTitleContainer}>
                    <div className={`${style.iconContainer} ${isSwitchOn ? style.iconActive : style.iconInactive}`}>
                        {renderServiceIcon()}
                    </div>
                    <span className={`${style.title} ${isSwitchOn ? style.titleActive : ''}`}>
                        {serviceName}
                    </span>
                </div>

                {/* Switch Toggle */}
                <label className={style.switch}>
                    <input
                        type="checkbox"
                        checked={isSwitchOn}
                        onChange={() => onToggleActive(serviceKey)}
                    />
                    <span className={style.slider}></span>
                </label>
            </div>

            {/* --- Warning Banner --- */}
            {/* Показываем, если тест не сдан. Если свитч включен, но тест не сдан, это блокирующий фактор */}
            {showTestWarning && (
                <div className={style.warningContainer}>
                    <div className={style.warningIcon}><Icons.Warning /></div>
                    <div className={style.warningContent}>
                        <p className={style.warningText}>
                            {testDetails.message || t('TestRequiredForActivation', 'Требуется сдать тест для активации этой услуги.')}
                        </p>
                        {testDetails.test_id && (
                            <button className={style.linkText} onClick={() => onGoToTests(testDetails.test_id)}>
                                {t('CompleteTestPrompt', 'Пройти тест')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* --- Active Content --- */}
            {/* Разворачиваем контент если свитч включен.
                Если тест не сдан, но свитч включили - показываем контент, но он не сохранится как активный на сервере без теста */}
            {isSwitchOn && (
                <div className={style.content}>

                    {/* Row 1: Base Price & Unit */}
                    <div className={style.inputsRow}>
                        <div className={style.inputGroupFull}>
                            <label className={style.inputLabel}>{t('BasePrice', 'Базовая цена')}</label>
                            <div className={style.priceInputWrapper}>
                                <span className={style.currencyPrefix}>{currencySymbol}</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className={style.priceInput}
                                    placeholder="0"
                                    value={settings.price_per_unit || ''}
                                    onChange={(e) => onChangeSetting(serviceKey, 'price_per_unit', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={style.inputGroupFull} style={{ marginLeft: '15px' }}>
                            <label className={style.inputLabel}>{t('Unit', 'За')}</label>
                            {isDogWalking ? (
                                <div className={style.selectWrapper}>
                                    <select
                                        value={settings.unit || settings.default_unit_from_api}
                                        onChange={(e) => onChangeSetting(serviceKey, 'unit', e.target.value)}
                                        className={style.nativeSelect}
                                    >
                                        {walkDurationOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <div className={style.selectIcon}><Icons.ChevronDown /></div>
                                </div>
                            ) : (
                                <div className={style.readOnlyUnit}>
                                    {getUnitName(currentUnitForDisplay)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recommendation Badge */}
                    {settings.recommended_price_from_api !== null && (
                        <div className={style.recommendationBadge}>
                            <Icons.TrendingUp />
                            <span>
                                {t('Recommended', 'Средняя цена')}: {settings.recommended_price_from_api} {currencySymbol}
                            </span>
                        </div>
                    )}

                    {/* Row 2: Secondary Inputs (Not for walking) */}
                    {!isDogWalking && (
                        <div className={style.inputsRow} style={{ marginTop: '16px' }}>
                            <div className={style.inputGroupHalf}>
                                <label className={style.inputLabelSmall}>{t('PricePerAdditionalPet', 'Доп. питомец')}</label>
                                <div className={style.smallInputWrapper}>
                                    <span className={style.currencyPrefixSmall}>{currencySymbol}</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className={style.smallInput}
                                        placeholder="0"
                                        value={settings.price_per_additional_pet || ''}
                                        onChange={(e) => onChangeSetting(serviceKey, 'price_per_additional_pet', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={style.inputGroupHalf}>
                                <label className={style.inputLabelSmall}>{t('MaxPets', 'Макс. питомцев')}</label>
                                <div className={style.smallInputWrapper}>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className={style.smallInput}
                                        style={{ paddingLeft: '10px' }}
                                        placeholder="∞"
                                        value={settings.max_pets || ''}
                                        onChange={(e) => onChangeSetting(serviceKey, 'max_pets', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Row 3+: Chips Selectors */}
                    {!isDogWalking && (
                        <div className={style.sectionSpacer}>
                            <SelectOption
                                label={t('AllowedPetTypes', 'Кого принимаете?')}
                                options={ALL_PET_TYPES}
                                value={settings.allowed_pet_types}
                                onChange={(val: any) => onMultiSelectChange(serviceKey, 'allowed_pet_types', val)}
                                isMultiSelect={true}
                                showDescription={false}
                            />
                        </div>
                    )}

                    {showDogSizes && (
                        <div className={style.sectionSpacer}>
                            <SelectOption
                                label={t('AllowedDogSizes', 'Размеры собак')}
                                options={ALL_PET_SIZES}
                                value={settings.allowed_dog_sizes}
                                onChange={(val: any) => onMultiSelectChange(serviceKey, 'allowed_dog_sizes', val)}
                                isMultiSelect={true}
                                showDescription={true}
                            />
                        </div>
                    )}

                    {showCatSizes && (
                        <div className={style.sectionSpacer}>
                            <SelectOption
                                label={t('AllowedCatSizes', 'Размеры кошек')}
                                options={ALL_PET_SIZES}
                                value={settings.allowed_cat_sizes}
                                onChange={(val: any) => onMultiSelectChange(serviceKey, 'allowed_cat_sizes', val)}
                                isMultiSelect={true}
                                showDescription={true}
                            />
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default React.memo(ServiceConfigurationCard);