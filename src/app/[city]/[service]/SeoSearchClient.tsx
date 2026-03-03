// --- File: src/app/[city]/[service]/SeoSearchClient.tsx ---
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { YMaps, Map, Placemark, Clusterer, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';
import { AppDispatch, RootState } from '@/store';
import { setSearchParams, performSearch } from '@/store/slices/searchSlice';
import { config } from '@/config/appConfig';

import Header from '@/components/layout/Header';
import FilterBar from '@/components/search/FilterBar';
import SitterCardWeb from '@/components/search/SitterCardWeb';
import LeadCaptureModal from '@/components/modals/LeadCaptureModal';
import { AuthModal } from '@/components/modals/AuthModal';
import style from '@/style/pages/SearchResults.module.scss';

const MapIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const ListIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;

const CROWN_SVG_STRING = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" fill="currentColor"/></svg>`;
const DEBOUNCE_DELAY = 600;

const DogDetectiveIcon = () => (
    <svg width="240" height="240" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="96" fill="#FFF8E1" />
        <g transform="translate(25, 35) scale(0.75)">
            <path d="M60 130 Q50 180, 30 200 H170 Q150 180, 140 130" fill="#FFA726" />
            <path d="M52 65 C 15 80, 25 145, 55 145 C 70 145, 65 110, 60 100" fill="#EF6C00" stroke="#E65100" strokeWidth="2" />
            <path d="M148 65 C 185 80, 175 145, 145 145 C 130 145, 135 110, 140 100" fill="#EF6C00" stroke="#E65100" strokeWidth="2" />
            <rect x="50" y="55" width="100" height="90" rx="45" fill="#FFA726" />
            <circle cx="75" cy="85" r="18" fill="#FFCC80" opacity="0.6" />
            <ellipse cx="100" cy="115" rx="35" ry="24" fill="#FFE0B2" />
            <path d="M90 107 Q100 103, 110 107 Q105 120, 95 120 Q85 115, 90 107" fill="#3E2723" />
            <path d="M100 120 L100 128" stroke="#3E2723" strokeWidth="2" />
            <path d="M92 128 Q100 132, 108 128" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="75" cy="85" r="6" fill="#3E2723" />
            <circle cx="77" cy="83" r="2" fill="white" />
            <path d="M68 75 Q75 70, 82 75" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="125" cy="85" r="6" fill="#3E2723" />
            <circle cx="127" cy="83" r="2" fill="white" />
            <path d="M118 75 Q125 70, 132 75" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M45 60 Q100 50, 155 60" fill="#8D6E63" />
            <path d="M90 20 Q80 30, 92 35 H108 Q120 30, 110 20" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
            <path d="M100 35 L100 28" stroke="#5D4037" strokeWidth="2" />
            <path d="M55 60 C55 15, 145 15, 145 60" fill="#8D6E63" stroke="#5D4037" strokeWidth="1" />
            <path d="M55 60 Q100 50, 145 60 L145 45 Q100 35, 55 45 Z" fill="#4E342E" />
            <text x="100" y="55" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" fill="white" textAnchor="middle">PetsOk</text>
        </g>
    </svg>
);

interface SeoSearchClientProps {
    cityName?: string;
    reduxServiceKey?: string;
    seoData?: any;
    initialSitters?: any[];
    initialPagination?: any;
    isGeneralSearch?: boolean;
}

export default function SeoSearchClient({
    cityName,
    reduxServiceKey,
    seoData,
    initialSitters = [],
    initialPagination,
    isGeneralSearch = false
}: SeoSearchClientProps) {
    const dispatch = useDispatch<AppDispatch>();
    const searchParamsHook = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const { searchResults, searchParams: reduxParams, isLoading, isFetchingMore, pagination } = useSelector((state: RootState) => state.search);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [leadModalOpen, setLeadModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    const [hoveredSitterId, setHoveredSitterId] = useState<number | null>(null);

    const [mapState, setMapState] = useState<{ center: number[], zoom: number }>({ center: [55.75, 37.57], zoom: 10 });
    const [ymapsNamespace, setYmapsNamespace] = useState<any>(null);

    const mapRef = useRef<any>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Флаги контроля карты
    const isProgrammaticMove = useRef(true); // Защита от авто-сдвигов
    const isUserDraggingMap = useRef(false); // Детектор касания человека

    const displaySitters = isGeneralSearch || searchResults.length > 0 ? searchResults : initialSitters;
    const displayPagination = isGeneralSearch || pagination ? pagination : initialPagination;

    // =========================================================================
    // 1. ИНИЦИАЛИЗАЦИЯ (Загрузка страницы)
    // =========================================================================
    useEffect(() => {
        const latStr = searchParamsHook.get('lat');
        const lonStr = searchParamsHook.get('lon');
        const zoomStr = searchParamsHook.get('zoom');
        const addrStr = searchParamsHook.get('address');
        const serviceKeyQuery = searchParamsHook.get('service_key');

        const petTypeIds = searchParamsHook.get('pet_type_ids') ? searchParamsHook.get('pet_type_ids')!.split(',').map(Number) : undefined;
        const dogSizeIds = searchParamsHook.get('dog_size_ids') ? searchParamsHook.get('dog_size_ids')!.split(',').map(Number) : undefined;
        const catSizeIds = searchParamsHook.get('cat_size_ids') ? searchParamsHook.get('cat_size_ids')!.split(',').map(Number) : undefined;

        const initialParams: any = {
            service_key: serviceKeyQuery || reduxServiceKey || reduxParams.service_key || 'boarding',
            pet_type_ids: petTypeIds || reduxParams.pet_type_ids || [],
            dog_size_ids: dogSizeIds || reduxParams.dog_size_ids || [],
            cat_size_ids: catSizeIds || reduxParams.cat_size_ids || [],
        };

        if (latStr && lonStr) {
            initialParams.latitude = parseFloat(latStr);
            initialParams.longitude = parseFloat(lonStr);
            initialParams.searchReason = 'coordinates';
            initialParams.address = undefined;
            initialParams.city = undefined;
            setMapState({ center: [initialParams.latitude, initialParams.longitude], zoom: zoomStr ? parseInt(zoomStr) : 12 });
        }
        else if (!isGeneralSearch && cityName) {
            initialParams.address = cityName;
            initialParams.searchReason = 'city';
            initialParams.latitude = undefined;
            initialParams.longitude = undefined;
        }
        else if (isGeneralSearch && addrStr) {
            initialParams.address = addrStr;
            initialParams.searchReason = 'city';
            initialParams.latitude = undefined;
            initialParams.longitude = undefined;
        } else {
            initialParams.searchReason = 'initial';
        }

        dispatch(setSearchParams(initialParams));
        dispatch(performSearch({ params: initialParams, page: 1, isNewSearch: true }));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cityName, reduxServiceKey, isGeneralSearch, dispatch]);


    // =========================================================================
    // 2. АВТО-МАСШТАБИРОВАНИЕ КАРТЫ ПОД МАРКЕРЫ (Auto-Fit Bounds)
    // =========================================================================
    useEffect(() => {
        // Мы делаем авто-фит ТОЛЬКО если пользователь не двигает карту сам (поиск по городу)
        if (reduxParams.searchReason !== 'map_bounds' && displaySitters.length > 0 && mapRef.current) {

            let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
            let validMarkersCount = 0;

            displaySitters.forEach((s: any) => {
                if (s.latitude && s.longitude) {
                    const lat = parseFloat(s.latitude);
                    const lon = parseFloat(s.longitude);
                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                    minLon = Math.min(minLon, lon);
                    maxLon = Math.max(maxLon, lon);
                    validMarkersCount++;
                }
            });

            if (validMarkersCount > 0) {
                isProgrammaticMove.current = true; // Блокируем onBoundsChange!

                if (validMarkersCount === 1) {
                    // Если ситтер один, просто центрируем на нем
                    mapRef.current.setCenter([minLat, minLon], 14);
                    setTimeout(() => { isProgrammaticMove.current = false; }, 800);
                } else {
                    // Если ситтеров много, отдаляем карту, чтобы влезли все
                    mapRef.current.setBounds(
                        [[minLat, minLon], [maxLat, maxLon]],
                        { checkZoomRange: true, zoomMargin: 40 } // zoomMargin - отступы от краев карты
                    ).then(() => {
                        // Карта закончила движение
                        setTimeout(() => { isProgrammaticMove.current = false; }, 800);
                    }).catch(() => {
                        setTimeout(() => { isProgrammaticMove.current = false; }, 800);
                    });
                }
            }
        }
    }, [displaySitters, reduxParams.searchReason]);


    // =========================================================================
    // 3. ДВИЖЕНИЕ КАРТЫ ПОЛЬЗОВАТЕЛЕМ
    // =========================================================================
    const onBoundsChange = () => {
        // Игнорируем изменения границ, вызванные инициализацией или Auto-Fit
        if (isProgrammaticMove.current || !isUserDraggingMap.current) return;

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            const mapInstance = mapRef.current;
            if (!mapInstance) return;

            const bounds = mapInstance.getBounds();
            const center = mapInstance.getCenter();
            const zoom = mapInstance.getZoom();

            // Жестко перезаписываем URL: добавляем координаты и УДАЛЯЕМ адрес
            const newUrlParams = new URLSearchParams(searchParamsHook.toString());
            newUrlParams.set('lat', center[0].toFixed(6));
            newUrlParams.set('lon', center[1].toFixed(6));
            newUrlParams.set('zoom', zoom.toString());
            newUrlParams.delete('address');

            router.replace(`${pathname}?${newUrlParams.toString()}`, { scroll: false });

            const newParams = {
                ...reduxParams,
                searchReason: 'map_bounds' as const,
                sw_lat: bounds[0][0],
                sw_lon: bounds[0][1],
                ne_lat: bounds[1][0],
                ne_lon: bounds[1][1],
                latitude: center[0],
                longitude: center[1],
                radius_km: undefined,
                address: undefined,
                city: undefined
            };

            dispatch(setSearchParams(newParams));
            dispatch(performSearch({ params: newParams, page: 1, isNewSearch: true }));

            // Сбрасываем флаг драга
            isUserDraggingMap.current = false;
        }, DEBOUNCE_DELAY);
    };

    // =========================================================================
    // 4. ПОДСВЕТКА МАРКЕРОВ
    // =========================================================================
    useEffect(() => {
        const handleMapMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const marker = target.closest('.petsok-map-marker');
            if (marker) {
                const id = marker.getAttribute('data-id');
                if (id) setHoveredSitterId(Number(id));
            }
        };

        const handleMapMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.petsok-map-marker')) {
                setHoveredSitterId(null);
            }
        };

        document.addEventListener('mouseover', handleMapMouseOver);
        document.addEventListener('mouseout', handleMapMouseOut);

        return () => {
            document.removeEventListener('mouseover', handleMapMouseOver);
            document.removeEventListener('mouseout', handleMapMouseOut);
        };
    }, []);

    useEffect(() => {
        document.querySelectorAll('.petsok-map-marker').forEach(el => {
            el.classList.remove('is-hovered');
            const parent = el.closest('.ymaps-2-1-placemark-overlay') as HTMLElement;
            if (parent) {
                const isPremium = el.classList.contains('is-premium');
                parent.style.zIndex = isPremium ? '1000' : '100';
            }
        });

        if (hoveredSitterId) {
            const activeMarker = document.querySelector(`.petsok-map-marker[data-id="${hoveredSitterId}"]`);
            if (activeMarker) {
                activeMarker.classList.add('is-hovered');
                const parent = activeMarker.closest('.ymaps-2-1-placemark-overlay') as HTMLElement;
                if (parent) {
                    parent.style.zIndex = '99999';
                }
            }
        }
    }, [hoveredSitterId]);


    const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 300) {
            if (!isLoading && !isFetchingMore && displayPagination && displayPagination.current_page < displayPagination.total_pages) {
                dispatch(performSearch({ params: reduxParams, page: displayPagination.current_page + 1, isNewSearch: false }));
            }
        }
    };

    const scrollToCard = (id: number) => {
        const card = document.getElementById(`sitter-card-${id}`);
        if (card && listContainerRef.current) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.remove(style.flashEffect);
            void card.offsetWidth;
            card.classList.add(style.flashEffect);

            setHoveredSitterId(id);
            setTimeout(() => setHoveredSitterId(null), 2000);
        }
    };

    const handleCreateOrderClick = () => {
        if (isAuthenticated) {
            router.push('/cabinet/orders/create');
        } else {
            setAuthModalOpen(true);
        }
    };

    const customIconLayout = useMemo(() => {
        if (!ymapsNamespace) return null;
        return ymapsNamespace.templateLayoutFactory.createClass(
            '$[properties.iconContent]'
        );
    }, [ymapsNamespace]);

    return (
        <>
            <Header onAuthClick={() => setAuthModalOpen(true)} />

            <div className={style.searchPageLayout}>
                <FilterBar />

                <div className={style.contentSplitView}>
                    <div
                        ref={listContainerRef}
                        className={`${style.resultsListColumn} ${viewMode === 'map' ? style.hiddenOnMobile : ''}`}
                        onScroll={handleListScroll}
                    >
                        <div className={style.resultsHeader}>
                            {!isGeneralSearch && seoData ? (
                                <><h1>{seoData.h1}</h1><p>Найдено {displayPagination?.total || displaySitters.length} специалистов</p></>
                            ) : (
                                <><h1>{isLoading && displaySitters.length === 0 ? 'Поиск...' : `Найдено ${displayPagination?.total || displaySitters.length} специалистов`}</h1><p>Проверенные специалисты рядом с вами</p></>
                            )}
                        </div>

                        <div className={style.cardsGrid}>
                            {displaySitters.map((sitter: any) => (
                                <div key={sitter.id} id={`sitter-card-${sitter.id}`} className={style.cardScrollTarget}>
                                    <SitterCardWeb
                                        data={sitter}
                                        isHovered={hoveredSitterId === sitter.id}
                                        onHover={() => setHoveredSitterId(sitter.id)}
                                        onLeave={() => setHoveredSitterId(null)}
                                    />
                                </div>
                            ))}

                            {isLoading && displaySitters.length === 0 && <div className={style.loaderContainer}>Загрузка...</div>}
                            {isFetchingMore && <div className={style.miniLoader}>Подгрузка...</div>}

                            {!isLoading && displaySitters.length === 0 && (
                                <div className={style.noResultsCard}>
                                    <div className={style.noResultsIcon}>
                                        <DogDetectiveIcon />
                                    </div>
                                    <h3 className={style.noResultsTitle}>Здесь пока тихо...</h3>
                                    <p className={style.noResultsText}>Попробуйте убрать фильтры или сдвинуть карту в другой район.</p>
                                    <button onClick={handleCreateOrderClick} className={style.createRequestBtn}>Создать заказ</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`${style.mapColumn} ${viewMode === 'list' ? style.hiddenOnMobile : ''}`}>
                        <YMaps query={{ apikey: config.yandexMapsApiKey, lang: 'ru_RU', load: 'package.full' }}>
                            {/* Обертка для отлова человеческого касания/клика */}
                            <div
                                style={{ width: '100%', height: '100%' }}
                                onPointerDown={() => { isUserDraggingMap.current = true; }}
                                onWheel={() => { isUserDraggingMap.current = true; }}
                            >
                                <Map
                                    state={{ ...mapState, controls: [] }}
                                    defaultState={{ center: mapState.center, zoom: mapState.zoom, behaviors: ['default', '!scrollZoom'] }}
                                    options={{ suppressMapOpenBlock: true, minZoom: 3, maxZoom: 18 }}
                                    instanceRef={(ref) => {
                                        mapRef.current = ref;
                                        if (ref) ref.behaviors.disable('scrollZoom');
                                    }}
                                    className={style.yandexMapInstance}
                                    width="100%" height="100%"
                                    onBoundsChange={onBoundsChange}
                                    onLoad={(ymaps) => setYmapsNamespace(ymaps)}
                                >
                                    <GeolocationControl options={{ position: { right: 10, top: 100 } }} />
                                    <ZoomControl options={{ position: { right: 10, top: 150 } }} />

                                    <Clusterer options={{ preset: 'islands#invertedBlueClusterIcons', groupByCoordinates: false, clusterDisableClickZoom: false }}>
                                        {displaySitters.map((sitter: any) => {
                                            if (!sitter.latitude || !sitter.longitude) return null;

                                            const isPremium = sitter.is_premium;
                                            const price = Math.round(sitter.service_price || 0);

                                            let markerClass = isPremium ? 'is-premium' : '';
                                            let innerHtml = isPremium ? `<span class="marker-icon">${CROWN_SVG_STRING}</span>${price}₽` : `${price}₽`;

                                            let finalHtml = `<div data-id="${sitter.id}" class="petsok-map-marker ${markerClass}">${innerHtml}</div>`;

                                            return (
                                                <Placemark
                                                    key={sitter.id}
                                                    geometry={[parseFloat(sitter.latitude), parseFloat(sitter.longitude)]}
                                                    properties={{ iconContent: finalHtml }}
                                                    options={{
                                                        iconLayout: customIconLayout || 'default#image',
                                                        zIndex: isPremium ? 1000 : 100,
                                                        // @ts-ignore
                                                        iconShape: { type: 'Rectangle', coordinates: [[-30, -15], [30, 15]] }
                                                    }}
                                                    onClick={() => {
                                                        if (viewMode === 'map') {
                                                            setViewMode('list');
                                                            setTimeout(() => scrollToCard(sitter.id), 100);
                                                        } else {
                                                            scrollToCard(sitter.id);
                                                        }
                                                    }}
                                                />
                                            )
                                        })}
                                    </Clusterer>
                                </Map>
                            </div>
                        </YMaps>
                    </div>
                </div>

                <button className={style.floatingMapToggle} onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}>
                    {viewMode === 'list' ? <>Показать карту <MapIcon /></> : <>К списку <ListIcon /></>}
                </button>
            </div>

            <LeadCaptureModal
                isOpen={leadModalOpen}
                onClose={() => { setLeadModalOpen(false); localStorage.setItem('leadModalClosed', 'true'); }}
                onSuccess={() => { setLeadModalOpen(false); setAuthModalOpen(true); }}
                city={cityName || reduxParams.address}
            />
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="register" />
        </>
    );
}