// --- File: src/components/search/FilterBar.tsx ---
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import style from '../../style/components/search/FilterBar.module.scss';
import { fetchAddressSuggestions } from "../../services/api";
import { setSearchParams, performSearch } from '../../store/slices/searchSlice';
import { RootState, AppDispatch } from '../../store';

// Icons
import LocationPinIcon from '../icons/LocationPinIcon';
import BoardingIcon from '../icons/BoardingIcon';
import DogWalkingIcon from '../icons/DogWalkingIcon';
import DropInVisitsIcon from '../icons/DropInVisitsIcon';
import DoggyDayCareIcon from '../icons/DoggyDayCareIcon';
import HouseSittingIcon from '../icons/HouseSittingIcon';

const SearchIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const ChevronDownIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>;
const FilterIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>;

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise(resolve => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => resolve(func(...args)), waitFor);
        });
};

// Конфигурация услуг с иконками
const SERVICES_CONFIG = [
    { key: 'boarding', label: 'Передержка', Icon: BoardingIcon },
    { key: 'walking', label: 'Выгул', Icon: DogWalkingIcon },
    { key: 'doggy_day_care', label: 'Дневная няня', Icon: DoggyDayCareIcon },
    { key: 'drop_in_visit', label: 'Визиты', Icon: DropInVisitsIcon },
    { key: 'house_sitting', label: 'Присмотр дома', Icon: HouseSittingIcon },
];

const FilterBar: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { searchParams } = useSelector((state: RootState) => state.search);
    const [, setUrlParams] = useSearchParams();

    // Локальное состояние для UI
    const [activeSection, setActiveSection] = useState<'location' | 'service' | null>(null);

    // Значения полей (синхронизируются с Redux при маунте)
    const [addressInput, setAddressInput] = useState(searchParams.address || '');
    const [selectedService, setSelectedService] = useState(searchParams.service_key || 'boarding');

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Синхронизация при изменении URL или Redux (например, при переходе с Главной)
    useEffect(() => {
        if (searchParams.address) setAddressInput(searchParams.address);
        if (searchParams.service_key) setSelectedService(searchParams.service_key);
    }, [searchParams.address, searchParams.service_key]);

    // Фокус на инпуте при открытии секции
    useEffect(() => {
        if (activeSection === 'location' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [activeSection]);

    // Автокомплит адреса
    const debouncedFetchSuggestions = useMemo(() => debounce(async (query: string) => {
        if (query.length < 3) { setSuggestions([]); return; }
        try { const results = await fetchAddressSuggestions(query); setSuggestions(results); } catch { setSuggestions([]); }
    }, 400), []);

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAddressInput(val);
        debouncedFetchSuggestions(val);
        if (activeSection !== 'location') setActiveSection('location');
    };

    const handleSuggestionClick = (suggestion: string) => {
        setAddressInput(suggestion);
        setSuggestions([]);
        setActiveSection(null); // Закрываем после выбора
    };

    const handleServiceSelect = (key: string) => {
        setSelectedService(key);
        setActiveSection(null); // Закрываем после выбора
    };

    const handleSearch = () => {
        setActiveSection(null);
        setSuggestions([]);

        // Формируем новые параметры поиска
        const newParams = {
            ...searchParams,
            address: addressInput,
            service_key: selectedService,
            searchReason: 'city' as const
        };

        // Отправляем в Redux
        dispatch(setSearchParams(newParams));
        // Запускаем поиск
        dispatch(performSearch({ params: newParams, page: 1, isNewSearch: true }));

        // Обновляем URL
        const urlP: any = { service_key: selectedService };
        if (addressInput) urlP.address = addressInput;
        setUrlParams(urlP);
    };

    // Закрытие при клике вне
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setActiveSection(null);
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Получаем данные выбранной услуги для отображения
    const activeServiceConfig = SERVICES_CONFIG.find(s => s.key === selectedService) || SERVICES_CONFIG[0];
    const ActiveServiceIcon = activeServiceConfig.Icon;

    return (
        <div className={style.filterBarWrapper} ref={wrapperRef}>
            <div className={style.container}>
                <div className={style.searchBar}>

                    {/* --- СЕКЦИЯ 1: ЛОКАЦИЯ --- */}
                    <div
                        className={`${style.fieldSection} ${activeSection === 'location' ? style.active : ''}`}
                        onClick={() => setActiveSection('location')}
                    >
                        <div className={style.label}>{t('exploreHeader.whereToSearchPlaceholder', 'Где')}</div>
                        <input
                            ref={inputRef}
                            type="text"
                            className={style.input}
                            placeholder={t('search.location_placeholder', 'Район или адрес')}
                            value={addressInput}
                            onChange={handleLocationChange}
                            autoComplete="off"
                        />

                        {/* Выпадающий список подсказок */}
                        {activeSection === 'location' && suggestions.length > 0 && (
                            <div className={style.dropdown}>
                                {suggestions.map((s, i) => (
                                    <div key={i} className={style.suggestionItem} onClick={(e) => { e.stopPropagation(); handleSuggestionClick(s); }}>
                                        <div className={style.iconBox}><LocationPinIcon width={18} /></div>
                                        <span>{s}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={style.divider}></div>

                    {/* --- СЕКЦИЯ 2: УСЛУГА --- */}
                    <div
                        className={`${style.fieldSection} ${activeSection === 'service' ? style.active : ''}`}
                        onClick={() => setActiveSection(activeSection === 'service' ? null : 'service')}
                    >
                        <div className={style.label}>{t('common.service', 'Услуга')}</div>
                        <div className={style.valueText}>
                            {activeServiceConfig.label}
                        </div>

                        {/* Выпадающий список услуг */}
                        {activeSection === 'service' && (
                            <div className={style.dropdown} onClick={e => e.stopPropagation()}>
                                <div className={style.servicesGrid}>
                                    {SERVICES_CONFIG.map(s => (
                                        <div
                                            key={s.key}
                                            className={`${style.serviceItem} ${selectedService === s.key ? style.selected : ''}`}
                                            onClick={() => handleServiceSelect(s.key)}
                                        >
                                            <div className={style.serviceIcon}>
                                                <s.Icon width={20} height={20} />
                                            </div>
                                            <span className={style.serviceName}>{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- КНОПКИ ДЕЙСТВИЯ --- */}
                    <div className={style.searchBtnWrapper}>
                        {/* Кнопка "Фильтры" (пока декоративная, можно расширить) */}
                        {/* <button className={style.filtersBtn} title="Фильтры">
                            <FilterIcon />
                        </button> */}

                        <button className={style.searchBtn} onClick={handleSearch}>
                            <SearchIcon />
                            <span>{t('SearchSitterItem.searchButtonText', 'Найти')}</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FilterBar;