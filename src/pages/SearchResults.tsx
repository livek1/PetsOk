import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate, useOutletContext } from 'react-router-dom';
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

// Иконки UI
const MapIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const ListIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;

// ИКОНКА ДЛЯ "НИЧЕГО НЕ НАЙДЕНО" (Собака-детектив, реалистичные уши, без лупы)
const DogDetectiveIcon = () => (
    <svg width="240" height="240" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Фоновый круг */}
        <circle cx="100" cy="100" r="96" fill="#FFF8E1" />

        <g transform="translate(25, 35) scale(0.75)">

            {/* --- ТЕЛО --- */}
            <path d="M60 130 Q50 180, 30 200 H170 Q150 180, 140 130" fill="#FFA726" />

            {/* --- УШИ (Реалистичные, висячие, за головой) --- */}
            {/* Левое ухо */}
            <path d="M52 65 C 15 80, 25 145, 55 145 C 70 145, 65 110, 60 100" fill="#EF6C00" stroke="#E65100" strokeWidth="2" />
            {/* Правое ухо */}
            <path d="M148 65 C 185 80, 175 145, 145 145 C 130 145, 135 110, 140 100" fill="#EF6C00" stroke="#E65100" strokeWidth="2" />

            {/* --- ГОЛОВА --- */}
            <rect x="50" y="55" width="100" height="90" rx="45" fill="#FFA726" />

            {/* Пятнышко вокруг левого глаза */}
            <circle cx="75" cy="85" r="18" fill="#FFCC80" opacity="0.6" />

            {/* --- МОРДОЧКА --- */}
            <ellipse cx="100" cy="115" rx="35" ry="24" fill="#FFE0B2" />

            {/* Нос */}
            <path d="M90 107 Q100 103, 110 107 Q105 120, 95 120 Q85 115, 90 107" fill="#3E2723" />

            {/* Рот (немного грустный/вопросительный, так как ничего не найдено) */}
            <path d="M100 120 L100 128" stroke="#3E2723" strokeWidth="2" />
            <path d="M92 128 Q100 132, 108 128" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* --- ГЛАЗА (Симметричные) --- */}
            {/* Левый глаз */}
            <circle cx="75" cy="85" r="6" fill="#3E2723" />
            <circle cx="77" cy="83" r="2" fill="white" /> {/* Блик */}
            {/* Бровь левая */}
            <path d="M68 75 Q75 70, 82 75" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Правый глаз */}
            <circle cx="125" cy="85" r="6" fill="#3E2723" />
            <circle cx="127" cy="83" r="2" fill="white" /> {/* Блик */}
            {/* Бровь правая */}
            <path d="M118 75 Q125 70, 132 75" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />


            {/* --- ШЛЯПА ДЕТЕКТИВА --- */}
            {/* Задний козырек */}
            <path d="M45 60 Q100 50, 155 60" fill="#8D6E63" />

            {/* Уши шапки (сверху, завязаны) */}
            <path d="M90 20 Q80 30, 92 35 H108 Q120 30, 110 20" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
            <path d="M100 35 L100 28" stroke="#5D4037" strokeWidth="2" />

            {/* Купол */}
            <path d="M55 60 C55 15, 145 15, 145 60" fill="#8D6E63" stroke="#5D4037" strokeWidth="1" />

            {/* Лента */}
            <path d="M55 60 Q100 50, 145 60 L145 45 Q100 35, 55 45 Z" fill="#4E342E" />

            {/* Текст PetsOk */}
            <text x="100" y="55" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" fill="white" textAnchor="middle">
                PetsOk
            </text>

            {/* Передний козырек */}
            <path d="M55 60 Q100 80, 145 60 Q100 70, 55 60" fill="#A1887F" stroke="#5D4037" strokeWidth="1" />
        </g>
    </svg>
);

const CROWN_SVG_STRING = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" fill="currentColor"/></svg>`;

const DEBOUNCE_DELAY = 600;
const RUSSIA_VIEW = { center: [55.75, 37.57], zoom: 10 };

// Интерфейс для контекста (чтобы взять функцию авторизации)
interface PageContextType {
    onAuthClick: (mode: 'login' | 'register', type?: 'client' | 'sitter') => void;
}

const SearchResults: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [searchParamsUrl, setSearchParamsUrl] = useSearchParams();

    // Получаем контекст для вызова модалки
    const { onAuthClick } = useOutletContext<PageContextType>();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

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

    // Обработчик кнопки создания заказа (конверсия из пустого поиска)
    const handleCreateOrderClick = () => {
        if (isAuthenticated) {
            navigate('/cabinet/orders/create');
        } else {
            onAuthClick('register', 'client');
        }
    };

    if (isSystemRoute) {
        return <NotFound />;
    }

    const handleMapLoad = (ymaps: any) => {
        setYmapsNamespace(ymaps);
        if (mapRef.current) {
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

                        {/* --- НОВЫЙ БЛОК "НИЧЕГО НЕ НАЙДЕНО" С ИКОНКОЙ СОБАКИ-ДЕТЕКТИВА --- */}
                        {!isLoading && searchResults.length === 0 && (
                            <div className={style.noResultsCard}>
                                <div className={style.noResultsIcon}>
                                    <DogDetectiveIcon />
                                </div>
                                <h3 className={style.noResultsTitle}>
                                    {t('search.noResultsTitle', 'Здесь пока тихо...')}
                                </h3>
                                <p className={style.noResultsText}>
                                    {t('search.noResultsCTA', 'Не нашли подходящего ситтера? Не беда! Создайте заказ, и мы оповестим всех исполнителей поблизости. Они сами откликнутся на вашу заявку.')}
                                </p>
                                <button onClick={handleCreateOrderClick} className={style.createRequestBtn}>
                                    {t('orders.createOrder', 'Создать заказ')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`${style.mapColumn} ${viewMode === 'list' ? style.hiddenOnMobile : ''}`}>
                    <YMaps query={{ lang: 'ru_RU' }}>
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
                                if (ref) ref.behaviors.disable('scrollZoom');
                            }}
                            className={style.yandexMapInstance}
                            width="100%" height="100%"
                            onBoundsChange={onBoundsChange}
                            onLoad={handleMapLoad}
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

                                    // Формируем классы
                                    let markerClass = '';
                                    if (isHovered) markerClass = 'is-hovered';
                                    else if (isPremium) markerClass = 'is-premium';

                                    // Формируем HTML контент маркера
                                    let contentHtml = '';
                                    if (isPremium) {
                                        // Для PRO: Иконка + Цена
                                        contentHtml = `<span class="marker-icon">${CROWN_SVG_STRING}</span>${price}₽`;
                                    } else {
                                        // Для обычных: Только цена
                                        contentHtml = `${price}₽`;
                                    }

                                    return (
                                        <Placemark
                                            key={sitter.id}
                                            geometry={[parseFloat(sitter.latitude), parseFloat(sitter.longitude)]}
                                            properties={{
                                                // Передаем HTML контент внутрь шаблона
                                                iconContent: contentHtml,
                                                markerClass: markerClass,
                                                hintContent: `<b>${sitter.name}</b><br/>${sitter.title || ''}`
                                            }}
                                            options={{
                                                // Используем наш CSS шаблон
                                                iconLayout: customIconLayout || 'default#image',
                                                // Z-index: Наведенные > Премиум > Обычные
                                                zIndex: isHovered ? 10000 : (isPremium ? 1000 : 100),
                                                // Важно: переопределяем shape, чтобы кликабельная область совпадала с "таблеткой"
                                                // Приблизительные размеры (ширина зависит от цены, но 60x30 покрывает большинство)
                                                // @ts-ignore
                                                iconShape: { type: 'Rectangle', coordinates: [[-30, -15], [30, 15]] },
                                                // Отключаем стандартный "хвостик" балуна, так как у нас свой стиль
                                                iconImageHref: '',
                                                iconImageSize: [0, 0],
                                            }}
                                            // Обработчики событий
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