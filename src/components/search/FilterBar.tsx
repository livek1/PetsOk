// --- File: src/components/search/FilterBar.tsx ---
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import style from '@/style/components/search/FilterBar.module.scss';
import { fetchAddressSuggestions } from "@/services/api";
import { setSearchParams, performSearch } from '@/store/slices/searchSlice';
import { RootState, AppDispatch } from '@/store';
import { getCitySlugFromName, SERVICE_KEYS_TO_SLUGS, SERVICE_SLUGS } from '@/config/seoConfig';
import { enabledServicesForSearch } from '@/config/appConfig';

import LocationPinIcon from '../icons/LocationPinIcon';

const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const ChevronDown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise(resolve => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => resolve(func(...args)), waitFor);
        });
};

const PET_SIZES = [
    { id: 1, name: 'Мини', desc: 'до 5 кг' },
    { id: 2, name: 'Маленький', desc: '5-10 кг' },
    { id: 3, name: 'Средний', desc: '10-20 кг' },
    { id: 4, name: 'Большой', desc: '20-40 кг' },
    { id: 5, name: 'Огромный', desc: '40+ кг' },
];

const FilterBar: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParamsHook = useSearchParams();

    const { searchParams } = useSelector((state: RootState) => state.search);
    const { activeServices, isConfigLoaded } = useSelector((state: RootState) => state.config);

    const [activeSection, setActiveSection] = useState<'location' | 'service' | 'pets' | null>(null);

    const getInitialService = () => {
        if (typeof window !== 'undefined') {
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            if (pathSegments.length >= 2 && SERVICE_SLUGS[pathSegments[1]]) {
                return SERVICE_SLUGS[pathSegments[1]];
            }
            const queryService = new URLSearchParams(window.location.search).get('service_key');
            if (queryService) return queryService;
        }
        return searchParams.service_key || 'boarding';
    };

    const [addressInput, setAddressInput] = useState('');
    const [selectedService, setSelectedService] = useState(getInitialService());
    const [petTypeIds, setPetTypeIds] = useState<number[]>(searchParams.pet_type_ids || []);
    const [dogSizeIds, setDogSizeIds] = useState<number[]>(searchParams.dog_size_ids || []);
    const [catSizeIds, setCatSizeIds] = useState<number[]>(searchParams.cat_size_ids || []);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // СИНХРОНИЗАЦИЯ: Если есть координаты, очищаем строку города
    useEffect(() => {
        const urlAddress = searchParamsHook?.get('address');
        const urlLat = searchParamsHook?.get('lat');

        if (searchParams.searchReason === 'map_bounds' || urlLat) {
            setAddressInput('');
        } else if (urlAddress) {
            setAddressInput(urlAddress);
        } else if (searchParams.address) {
            setAddressInput(searchParams.address);
        } else {
            setAddressInput('');
        }

        const pathSegments = pathname.split('/').filter(Boolean);
        let currentService = searchParams.service_key || 'boarding';

        if (pathSegments.length >= 2 && SERVICE_SLUGS[pathSegments[1]]) {
            currentService = SERVICE_SLUGS[pathSegments[1]];
        } else if (searchParamsHook?.get('service_key')) {
            currentService = searchParamsHook.get('service_key') as string;
        }

        setSelectedService(currentService);
        if (searchParams.pet_type_ids) setPetTypeIds(searchParams.pet_type_ids);
        if (searchParams.dog_size_ids) setDogSizeIds(searchParams.dog_size_ids);
        if (searchParams.cat_size_ids) setCatSizeIds(searchParams.cat_size_ids);
    }, [searchParams.address, searchParams.searchReason, searchParams.service_key, searchParamsHook, pathname]);

    useEffect(() => {
        if (activeSection === 'location' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [activeSection]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setActiveSection(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayedServices = useMemo(() => {
        return enabledServicesForSearch.filter(s => {
            if (!isConfigLoaded) return true;
            return activeServices.includes(s.id);
        });
    }, [activeServices, isConfigLoaded]);

    const activeServiceConfig = displayedServices.find(s => s.id === selectedService) || displayedServices[0];

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
        setActiveSection(null);
    };

    const togglePetType = (id: number) => {
        setPetTypeIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
    };
    const toggleSize = (id: number, type: 'dog' | 'cat') => {
        if (type === 'dog') setDogSizeIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
        else setCatSizeIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
    };

    const getPetsSummary = () => {
        if (petTypeIds.length === 0) return 'Кого оставляем?';
        let parts = [];
        if (petTypeIds.includes(1)) parts.push('Собака');
        if (petTypeIds.includes(2)) parts.push('Кошка');
        return parts.join(', ');
    };

    const handleSearch = () => {
        setActiveSection(null);
        setSuggestions([]);

        const isAddressFilled = addressInput.trim().length > 0;
        const citySlug = getCitySlugFromName(addressInput);
        const serviceSlug = SERVICE_KEYS_TO_SLUGS[selectedService] || selectedService;

        const urlP = new URLSearchParams(searchParamsHook.toString());

        urlP.delete('pet_type_ids');
        urlP.delete('dog_size_ids');
        urlP.delete('cat_size_ids');

        if (petTypeIds.length) urlP.append('pet_type_ids', petTypeIds.join(','));
        if (dogSizeIds.length) urlP.append('dog_size_ids', dogSizeIds.join(','));
        if (catSizeIds.length) urlP.append('cat_size_ids', catSizeIds.join(','));

        let finalAddress = undefined;
        let finalLat = searchParams.latitude;
        let finalLon = searchParams.longitude;
        let finalReason: any = searchParams.searchReason;
        let targetPath = pathname;

        // Логика 1: Пользователь ввел новый текстовый адрес
        if (isAddressFilled && addressInput !== searchParams.address) {
            urlP.delete('lat');
            urlP.delete('lon');
            urlP.delete('zoom');

            finalAddress = addressInput.trim();
            finalLat = undefined;
            finalLon = undefined;
            finalReason = 'city';

            if (citySlug && serviceSlug) {
                targetPath = `/${citySlug}/${serviceSlug}`;
                urlP.delete('address');
                urlP.delete('service_key');
            } else {
                targetPath = '/search';
                urlP.set('address', finalAddress);
                urlP.set('service_key', selectedService);
            }
        }
        // Логика 2: Адрес не меняли (просто применили фильтры или поменяли услугу)
        else {
            if (searchParamsHook.get('lat') && searchParamsHook.get('lon')) {
                finalReason = 'coordinates';
                finalAddress = undefined;
            } else {
                finalAddress = searchParams.address;
                finalReason = 'city';
            }

            if (pathname.includes('/search')) {
                urlP.set('service_key', selectedService);
            } else {
                const currentCitySlug = pathname.split('/')[1];
                if (currentCitySlug && serviceSlug) {
                    targetPath = `/${currentCitySlug}/${serviceSlug}`;
                }
            }
        }

        const newParams = {
            ...searchParams,
            address: finalAddress,
            city: finalAddress,
            latitude: finalLat,
            longitude: finalLon,
            service_key: selectedService,
            pet_type_ids: petTypeIds,
            dog_size_ids: dogSizeIds,
            cat_size_ids: catSizeIds,
            searchReason: finalReason,
            sw_lat: finalReason === 'city' ? undefined : searchParams.sw_lat,
            ne_lat: finalReason === 'city' ? undefined : searchParams.ne_lat,
        };

        dispatch(setSearchParams(newParams));
        dispatch(performSearch({ params: newParams, page: 1, isNewSearch: true }));

        const queryString = urlP.toString() ? `?${urlP.toString()}` : '';
        if (targetPath === pathname) {
            router.replace(`${targetPath}${queryString}`, { scroll: false });
        } else {
            router.push(`${targetPath}${queryString}`);
        }
    };

    const dropdownVariants: import("framer-motion").Variants = {
        hidden: isMobile ? { y: '100%', opacity: 1 } : { opacity: 0, y: -10, scale: 0.98 },
        visible: isMobile
            ? { y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 200 } }
            : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
        exit: isMobile
            ? { y: '100%', opacity: 1, transition: { duration: 0.2 } }
            : { opacity: 0, y: -5, scale: 0.98, transition: { duration: 0.15 } }
    };

    return (
        <div className={style.filterBarWrapper} ref={wrapperRef}>
            <div className={style.container}>

                <div className={style.unifiedSearchBar}>
                    <div className={`${style.searchSection} ${activeSection === 'location' ? style.active : ''}`} onClick={() => setActiveSection('location')}>
                        <span className={style.sectionLabel}>Где ищем?</span>
                        <input
                            ref={inputRef}
                            type="text"
                            className={style.locationInput}
                            placeholder="Город или адрес"
                            value={addressInput}
                            onChange={handleLocationChange}
                            autoComplete="off"
                        />
                        <AnimatePresence>
                            {activeSection === 'location' && suggestions.length > 0 && (
                                <motion.div
                                    className={style.dropdownPanel}
                                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                                >
                                    <h4 className={style.dropdownTitle}>Результаты поиска</h4>
                                    {suggestions.map((s, i) => (
                                        <div key={i} className={style.suggestionItem} onClick={(e) => { e.stopPropagation(); handleSuggestionClick(s); }}>
                                            <div className={style.iconBox}><LocationPinIcon width={18} /></div>
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className={style.divider} />

                    <div className={`${style.searchSection} ${activeSection === 'service' ? style.active : ''}`} onClick={() => { if (activeSection !== 'service') setActiveSection('service'); }}>
                        <span className={style.sectionLabel}>Услуга</span>
                        <span className={style.sectionValue}>{activeServiceConfig ? t(activeServiceConfig.nameKey) : 'Выбрать'}</span>

                        <AnimatePresence>
                            {activeSection === 'service' && (
                                <motion.div
                                    className={style.dropdownPanel} onClick={e => e.stopPropagation()}
                                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                                >
                                    <h4 className={style.dropdownTitle}>Какая услуга нужна?</h4>
                                    <div className={style.servicesGrid}>
                                        {displayedServices.map(s => (
                                            <div
                                                key={s.id}
                                                className={`${style.serviceItem} ${selectedService === s.id ? style.selected : ''}`}
                                                onClick={(e) => { e.stopPropagation(); setSelectedService(s.id); setActiveSection('pets'); }}
                                            >
                                                <div className={style.serviceIcon}><s.IconComponent width={24} height={24} /></div>
                                                <div className={style.serviceTexts}>
                                                    <span className={style.serviceName}>{t(s.nameKey)}</span>
                                                    {s.descriptionKey && <span className={style.serviceDesc}>{t(s.descriptionKey)}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className={style.divider} />

                    <div className={`${style.searchSection} ${activeSection === 'pets' ? style.active : ''}`} onClick={() => { if (activeSection !== 'pets') setActiveSection('pets'); }}>
                        <span className={style.sectionLabel}>Питомец</span>
                        <span className={style.sectionValue}>{getPetsSummary()}</span>

                        <AnimatePresence>
                            {activeSection === 'pets' && (
                                <motion.div
                                    className={`${style.dropdownPanel} ${style.rightAlign}`} onClick={e => e.stopPropagation()}
                                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                                >
                                    <h4 className={style.dropdownTitle}>Кого оставляем?</h4>

                                    <div className={style.petTypeSection}>
                                        <div className={style.petTypeHeader} onClick={(e) => { e.stopPropagation(); togglePetType(1); }}>
                                            <div className={`${style.checkbox} ${petTypeIds.includes(1) ? style.checked : ''}`}>
                                                {petTypeIds.includes(1) && <CheckIcon />}
                                            </div>
                                            <span className={style.petName}>Собака</span>
                                        </div>
                                        {petTypeIds.includes(1) && (
                                            <div className={style.sizesGrid}>
                                                {PET_SIZES.map(size => (
                                                    <div
                                                        key={`dog-${size.id}`}
                                                        className={`${style.sizeChip} ${dogSizeIds.includes(size.id) ? style.selected : ''}`}
                                                        onClick={(e) => { e.stopPropagation(); toggleSize(size.id, 'dog'); }}
                                                    >
                                                        <span>{size.name}</span>
                                                        <span className={style.sizeKg}>({size.desc})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className={style.petTypeSection}>
                                        <div className={style.petTypeHeader} onClick={(e) => { e.stopPropagation(); togglePetType(2); }}>
                                            <div className={`${style.checkbox} ${petTypeIds.includes(2) ? style.checked : ''}`}>
                                                {petTypeIds.includes(2) && <CheckIcon />}
                                            </div>
                                            <span className={style.petName}>Кошка</span>
                                        </div>
                                        {petTypeIds.includes(2) && (
                                            <div className={style.sizesGrid}>
                                                {PET_SIZES.map(size => (
                                                    <div
                                                        key={`cat-${size.id}`}
                                                        className={`${style.sizeChip} ${catSizeIds.includes(size.id) ? style.selected : ''}`}
                                                        onClick={(e) => { e.stopPropagation(); toggleSize(size.id, 'cat'); }}
                                                    >
                                                        <span>{size.name}</span>
                                                        <span className={style.sizeKg}>({size.desc})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button className={style.searchSubmitBtn} onClick={handleSearch}>
                        <SearchIcon /> Поиск
                    </button>
                </div>

                {/* МОБИЛКА */}
                <div className={style.mobileFiltersScroll}>
                    <div className={`${style.mobileChip} ${activeSection === 'location' ? style.active : ''}`} onClick={() => setActiveSection('location')}>
                        <LocationPinIcon width={16} />
                        {addressInput || 'Где ищем?'}
                    </div>

                    <div className={`${style.mobileChip} ${activeSection === 'service' ? style.active : ''}`} onClick={() => setActiveSection('service')}>
                        {activeServiceConfig ? t(activeServiceConfig.nameKey) : 'Услуга'} <ChevronDown />
                    </div>

                    <div className={`${style.mobileChip} ${activeSection === 'pets' ? style.active : ''}`} onClick={() => setActiveSection('pets')}>
                        {getPetsSummary()} <ChevronDown />
                    </div>
                </div>

                <AnimatePresence>
                    {activeSection && isMobile && (
                        <motion.div
                            className={style.mobileOverlay}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setActiveSection(null)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {activeSection && isMobile && (
                        <motion.button
                            className={style.mobileApplyBtn}
                            onClick={handleSearch}
                            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        >
                            Найти ситтеров
                        </motion.button>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default FilterBar;