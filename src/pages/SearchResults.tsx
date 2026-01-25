import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { YMaps, Map, Placemark, Clusterer, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';
import { RootState, AppDispatch } from '../store';
import { performSearch, setSearchParams } from '../store/slices/searchSlice';
import SitterCardWeb from '../components/search/SitterCardWeb';
import FilterBar from '../components/search/FilterBar';
import style from '../style/pages/SearchResults.module.scss';
import { Helmet } from 'react-helmet-async';
import { SERVICE_SLUGS, getCityNameFromSlug, getSeoMeta } from '../config/seoConfig';
import NotFound from './NotFound';
import { config } from '../config/appConfig';

const MapIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const ListIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;

const DEBOUNCE_DELAY = 600;
const RUSSIA_VIEW = { center: [55.75, 37.57], zoom: 10 };

const SearchResults: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const [searchParamsUrl, setSearchParamsUrl] = useSearchParams();

    const { citySlug, serviceSlug } = useParams<{ citySlug?: string; serviceSlug?: string }>();

    const isSystemRoute = [
        'error', '404', 'undefined', 'null', 'api', 'static', 'assets', 'json'
    ].includes((citySlug || '').toLowerCase());

    const { searchResults, searchParams: reduxParams, isLoading, isFetchingMore, pagination } = useSelector((state: RootState) => state.search);

    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [hoveredSitterId, setHoveredSitterId] = useState<number | null>(null);
    const [mapState, setMapState] = useState<{ center: number[], zoom: number }>(RUSSIA_VIEW);
    const [ymapsNamespace, setYmapsNamespace] = useState<any>(null);

    const mapRef = useRef<any>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const isProgrammaticMove = useRef(false);

    const seoMeta = useMemo(() => {
        if (citySlug && !isSystemRoute) {
            return getSeoMeta(citySlug, serviceSlug, t);
        }
        return {
            title: t('seo.search.title', 'Поиск ситтеров - PetsOk'),
            description: t('seo.search.description', 'Найдите лучшего ситтера для вашего питомца.'),
            h1: null
        };
    }, [citySlug, serviceSlug, t, isSystemRoute]);

    useEffect(() => {
        if (isSystemRoute) return;

        const addressParam = searchParamsUrl.get('address');
        const latStr = searchParamsUrl.get('lat');
        const lonStr = searchParamsUrl.get('lon');
        let service = searchParamsUrl.get('service_key') || reduxParams.service_key || 'boarding';

        const initialParams: any = {
            searchReason: 'initial'
        };

        if (citySlug) {
            initialParams.address = getCityNameFromSlug(citySlug);
            initialParams.searchReason = 'city';

            if (serviceSlug && SERVICE_SLUGS[serviceSlug]) {
                service = SERVICE_SLUGS[serviceSlug];
            }
        } else if (addressParam) {
            initialParams.address = addressParam;
            initialParams.searchReason = 'city';
        }

        if (latStr && lonStr) {
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);
            const zoom = searchParamsUrl.get('zoom') ? parseInt(searchParamsUrl.get('zoom')!) : 12;

            initialParams.latitude = lat;
            initialParams.longitude = lon;
            initialParams.searchReason = 'coordinates';
            delete initialParams.address;
            setMapState({ center: [lat, lon], zoom });
        } else if (reduxParams.latitude && !citySlug) {
            setMapState({ center: [reduxParams.latitude, reduxParams.longitude!], zoom: 12 });
        }

        initialParams.service_key = service;

        dispatch(setSearchParams(initialParams));
        dispatch(performSearch({ params: initialParams, page: 1, isNewSearch: true }));
    }, [citySlug, serviceSlug, isSystemRoute]);

    if (isSystemRoute) {
        return <NotFound />;
    }

    // Обработчик загрузки карты - ГАРАНТИРОВАННО ОТКЛЮЧАЕТ СКРОЛЛ ЗУМ
    const handleMapLoad = (ymaps: any) => {
        setYmapsNamespace(ymaps);
        if (mapRef.current) {
            // Явно отключаем поведение scrollZoom
            mapRef.current.behaviors.disable('scrollZoom');
        }
    };

    useEffect(() => {
        if (reduxParams.searchReason !== 'map_bounds' && reduxParams.latitude && reduxParams.longitude) {
            const currentCenter = mapRef.current?.getCenter();
            if (!currentCenter || (Math.abs(currentCenter[0] - reduxParams.latitude) > 0.001)) {
                isProgrammaticMove.current = true;
                setMapState({ center: [reduxParams.latitude, reduxParams.longitude], zoom: 12 });

                if (!citySlug) {
                    const newUrlParams = new URLSearchParams(searchParamsUrl);
                    newUrlParams.set('lat', reduxParams.latitude.toString());
                    newUrlParams.set('lon', reduxParams.longitude.toString());
                    newUrlParams.set('zoom', '12');
                    setSearchParamsUrl(newUrlParams, { replace: true });
                }

                setTimeout(() => { isProgrammaticMove.current = false; }, 1000);
            }
        }
    }, [reduxParams.latitude, reduxParams.longitude, reduxParams.searchReason, citySlug]);

    const onBoundsChange = () => {
        if (isProgrammaticMove.current) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current as any);

        debounceTimer.current = setTimeout(() => {
            const mapInstance = mapRef.current;
            if (!mapInstance) return;

            const bounds = mapInstance.getBounds();
            const center = mapInstance.getCenter();
            const zoom = mapInstance.getZoom();
            const [sw, ne] = bounds;

            if (!citySlug) {
                const newUrlParams = new URLSearchParams(searchParamsUrl);
                newUrlParams.set('lat', center[0].toFixed(6));
                newUrlParams.set('lon', center[1].toFixed(6));
                newUrlParams.set('zoom', zoom.toString());
                setSearchParamsUrl(newUrlParams, { replace: true });
            }

            const newParams = {
                ...reduxParams,
                searchReason: 'map_bounds' as const,
                sw_lat: sw[0],
                sw_lon: sw[1],
                ne_lat: ne[0],
                ne_lon: ne[1],
                latitude: center[0],
                longitude: center[1],
                radius_km: undefined
            };

            dispatch(setSearchParams(newParams));
            dispatch(performSearch({ params: newParams, page: 1, isNewSearch: true }));
        }, DEBOUNCE_DELAY);
    };

    const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 300) {
            if (!isLoading && !isFetchingMore && pagination && pagination.current_page < pagination.total_pages) {
                dispatch(performSearch({ params: reduxParams, page: pagination.current_page + 1, isNewSearch: false }));
            }
        }
    };

    const handleCardEnter = (id: number) => setHoveredSitterId(id);
    const handleCardLeave = () => setHoveredSitterId(null);

    const customIconLayout = useMemo(() => {
        if (!ymapsNamespace) return null;
        return ymapsNamespace.templateLayoutFactory.createClass(
            `<div class="petsok-map-marker $[properties.markerClass]">$[properties.iconContent]</div>`
        );
    }, [ymapsNamespace]);

    const onMarkerClick = (sitterId: number) => {
        if (viewMode === 'map') {
            setViewMode('list');
            setTimeout(() => scrollToCard(sitterId), 100);
        } else {
            scrollToCard(sitterId);
        }
    };

    const scrollToCard = (id: number) => {
        const card = document.getElementById(`sitter-card-${id}`);
        const container = listContainerRef.current;

        if (card && container) {
            const cardTop = card.offsetTop;
            const containerHeight = container.clientHeight;
            const cardHeight = card.clientHeight;
            const targetScroll = cardTop - (containerHeight / 2) + (cardHeight / 2);

            container.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });

            card.classList.add(style.flashEffect);
            setTimeout(() => card.classList.remove(style.flashEffect), 1000);
            setHoveredSitterId(id);
            setTimeout(() => setHoveredSitterId(null), 1500);
        }
    };

    useEffect(() => {
        const header = document.querySelector('header');
        if (header) header.classList.add('force-light-header');
        return () => { if (header) header.classList.remove('force-light-header'); };
    }, []);

    const breadcrumbSchema = citySlug ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://petsok.ru/" },
            { "@type": "ListItem", "position": 2, "name": getCityNameFromSlug(citySlug), "item": `https://petsok.ru/${citySlug}` },
            ...(serviceSlug ? [{ "@type": "ListItem", "position": 3, "name": seoMeta.h1, "item": `https://petsok.ru/${citySlug}/${serviceSlug}` }] : [])
        ]
    } : null;

    return (
        <div className={style.searchPageLayout}>
            <Helmet>
                <title>{seoMeta.title}</title>
                <meta name="description" content={seoMeta.description} />
                <link rel="canonical" href={window.location.href} />
                {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
            </Helmet>

            <FilterBar />

            <div className={style.contentSplitView}>
                <div
                    ref={listContainerRef}
                    className={`${style.resultsListColumn} ${viewMode === 'map' ? style.hiddenOnMobile : ''}`}
                    onScroll={handleListScroll}
                >
                    <div className={style.resultsHeader}>
                        {citySlug ? (
                            <>
                                <h1>{seoMeta.h1}</h1>
                                <p>{t('searchResults.foundCount', { count: pagination?.total || searchResults.length })}. {t('searchResults.subtext', 'Проверенные ситтеры рядом с вами')}</p>
                            </>
                        ) : (
                            <>
                                <h1>
                                    {isLoading && searchResults.length === 0
                                        ? t('search.loading', 'Поиск...')
                                        : t('searchResults.foundCount', { count: pagination?.total || searchResults.length, defaultValue: `Найдено ${pagination?.total || searchResults.length} ситтеров` })}
                                </h1>
                                <p>{t('searchResults.subtext', 'Проверенные ситтеры рядом с вами')}</p>
                            </>
                        )}
                    </div>

                    <div className={style.cardsGrid}>
                        {searchResults.map((sitter: any) => (
                            <div key={sitter.id} id={`sitter-card-${sitter.id}`}>
                                <SitterCardWeb
                                    data={sitter}
                                    isHovered={hoveredSitterId === sitter.id}
                                    onHover={() => handleCardEnter(sitter.id)}
                                    onLeave={handleCardLeave}
                                />
                            </div>
                        ))}

                        {isLoading && searchResults.length === 0 && <div className={style.loaderContainer}>Загрузка...</div>}
                        {isFetchingMore && <div className={style.miniLoader}>Подгрузка...</div>}
                        {!isLoading && searchResults.length === 0 && <div className={style.emptyState}><p>{t('search.noResults', 'Никого не найдено в этой области.')}</p></div>}
                    </div>
                </div>

                <div className={`${style.mapColumn} ${viewMode === 'list' ? style.hiddenOnMobile : ''}`}>
                    <YMaps query={{ apikey: config.yandexMapsApiKey, lang: 'ru_RU', load: 'package.full' }}>
                        <Map
                            state={{ ...mapState, controls: [] }}
                            defaultState={{
                                center: mapState.center,
                                zoom: mapState.zoom,
                                behaviors: ['default', '!scrollZoom'],
                            }}
                            options={{
                                suppressMapOpenBlock: true,
                                minZoom: 3,
                                maxZoom: 18,
                            }}
                            instanceRef={(ref) => {
                                mapRef.current = ref;
                                // Если реф уже доступен, на всякий случай отключаем
                                if (ref) ref.behaviors.disable('scrollZoom');
                            }}
                            className={style.yandexMapInstance}
                            width="100%" height="100%"
                            onBoundsChange={onBoundsChange}
                            onLoad={handleMapLoad} // <-- Вот здесь происходит основное отключение
                        >
                            <GeolocationControl options={{ position: { right: 10, top: 100 } }} />

                            <ZoomControl options={{ position: { right: 10, top: 150 } }} />
                            <Clusterer
                                options={{
                                    preset: 'islands#invertedBlueClusterIcons',
                                    groupByCoordinates: false,
                                    clusterDisableClickZoom: false
                                }}
                            >
                                {searchResults.map((sitter: any) => {
                                    if (!sitter.latitude || !sitter.longitude) return null;
                                    const isHovered = hoveredSitterId === sitter.id;
                                    const isPremium = sitter.is_premium;
                                    const price = Math.round(sitter.service_price || 0);
                                    const textColor = isPremium ? '#B45309' : '#000000';
                                    const fontWeight = isPremium ? '800' : '600';
                                    const contentHtml = isPremium
                                        ? `<span style="font-weight:${fontWeight}; color:${textColor}; font-family: sans-serif;">👑 ${price}₽</span>`
                                        : `<span style="font-weight:${fontWeight}; color:${textColor}; font-family: sans-serif;">${price}₽</span>`;
                                    let markerClass = '';
                                    if (isHovered) markerClass = 'is-hovered';
                                    else if (isPremium) markerClass = 'is-premium';

                                    return (
                                        <Placemark
                                            key={sitter.id}
                                            geometry={[parseFloat(sitter.latitude), parseFloat(sitter.longitude)]}
                                            properties={{
                                                iconContent: contentHtml,
                                                markerClass: markerClass,
                                                hintContent: `<b>${sitter.name}</b><br/>${sitter.title || ''}`
                                            }}
                                            options={{
                                                iconLayout: customIconLayout || 'default#image',
                                                zIndex: isHovered ? 2000 : (isPremium ? 100 : 1),
                                                // @ts-ignore
                                                iconShape: { type: 'Rectangle', coordinates: [[-30, -15], [30, 15]] }
                                            }}
                                            onMouseEnter={() => setHoveredSitterId(sitter.id)}
                                            onMouseLeave={() => setHoveredSitterId(null)}
                                            onClick={() => onMarkerClick(sitter.id)}
                                        />
                                    )
                                })}
                            </Clusterer>
                        </Map>
                    </YMaps>
                </div>
            </div>

            <button className={style.floatingMapToggle} onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}>
                {viewMode === 'list' ? <>Карта <MapIcon /></> : <>Список <ListIcon /></>}
            </button>
        </div>
    );
};

export default SearchResults;