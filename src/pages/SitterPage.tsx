// --- File: src/pages/SitterPage.tsx ---
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { YMaps, Map, ZoomControl, Circle } from '@pbe/react-yandex-maps';
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { useSelector } from 'react-redux';
import { RootState } from '../store';
// @ts-ignore
import heic2any from "heic2any";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

// --- API ---
import {
    getSitterProfile,
    SitterProfileResponse,
    getMyOrders,
    createOrderRequest
} from '../services/api';

import style from '../style/pages/SitterPage.module.scss';

// --- COMPONENTS ---
import SelectOrderModal from '../components/modals/SelectOrderModal';

// --- ICONS ---
import BoardingIcon from '../components/icons/BoardingIcon';
import DogWalkingIcon from '../components/icons/DogWalkingIcon';
import DropInVisitsIcon from '../components/icons/DropInVisitsIcon';
import DoggyDayCareIcon from '../components/icons/DoggyDayCareIcon';
import HouseSittingIcon from '../components/icons/HouseSittingIcon';
import { config } from '../config/appConfig';

// SVG Icons
const IconStar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>;
const IconGrid = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>;
const IconMapPin = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconCrown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>;
const IconEyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const IconPlay = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>;
const IconChevronUp = (props: React.SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M18 15l-6-6-6 6" /></svg>;
const IconShield = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconRibbon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
const IconRepeat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>;
const IconChecklist = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
const IconCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

// New Friendlier Icons
const IconHomeHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M12 14.5c1.5-1.5 3-1.5 3.5 0 1 1.5-1.5 3-3.5 3-2 0-4.5-1.5-3.5-3 .5-1.5 2-1.5 3.5 0z" fill="currentColor" fillOpacity="0.2" /></svg>;
const IconDiamond = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9z"></path></svg>;
const IconAcademic = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>;

// Иконка ребенка (улыбающееся лицо)
const IconChild = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
);

// --- ИСПРАВЛЕНИЕ 1: Добавляем возможность принимать props ---
const IconInfo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Interfaces ---
interface PageContextType {
    onAuthClick: (mode: 'login' | 'register', type?: 'client' | 'sitter') => void;
}

interface InfoModalState {
    title: string;
    text: string;
}

// Config for services
const getServiceConfig = (key: string) => {
    const configs: Record<string, { label: string; Icon: React.FC<any>; unit: string }> = {
        'boarding': { label: 'orderTypes.boarding', Icon: BoardingIcon, unit: 'ночь' },
        'walking': { label: 'orderTypes.walking', Icon: DogWalkingIcon, unit: 'прогулка' },
        'drop_in_visit': { label: 'orderTypes.dropInVisit', Icon: DropInVisitsIcon, unit: 'визит' },
        'doggy_day_care': { label: 'orderTypes.doggyDayCare', Icon: DoggyDayCareIcon, unit: 'день' },
        'house_sitting': { label: 'orderTypes.houseSitting', Icon: HouseSittingIcon, unit: 'сутки' }
    };
    return configs[key] || { label: key, Icon: BoardingIcon, unit: 'ед.' };
};

// --- UTILS ---
const getPetSizeLabel = (t: any, apiName: string) => {
    if (!apiName) return '';
    const normalized = apiName.toLowerCase();
    const keyMap: Record<string, string> = {
        'mini': 'mini', 'small': 'small', 'medium': 'medium', 'big': 'big', 'large': 'big', 'huge': 'huge', 'giant': 'huge'
    };
    const key = keyMap[normalized] || normalized;
    return t(`petSizes.${key}.name`, apiName);
};

// Функция склонения (год, года, лет)
const getPluralForm = (number: number, forms: [string, string, string]) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
};

const formatDateSince = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        return format(date, 'd MMMM yyyy', { locale: ru });
    } catch (e) {
        return dateString;
    }
};

const formatLastSeen = (dateString: string | null, isOnline: boolean) => {
    if (isOnline) return 'Сейчас онлайн';
    if (!dateString) return '';
    try {
        const date = parseISO(dateString);
        return `Был(а) в сети: ${formatDistanceToNow(date, { addSuffix: true, locale: ru })}`;
    } catch (e) {
        return '';
    }
};

// --- КОМПОНЕНТ "УМНОЙ" КАРТИНКИ/ВИДЕО ---
const MediaItemWithLoader: React.FC<{
    item: any;
    onClick: () => void;
    className?: string;
    overlay?: React.ReactNode;
}> = ({ item, onClick, className, overlay }) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    const url = item.url || '';
    const lowerUrl = url.toLowerCase();
    const isVideo = item.media_type === 'video' || lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.mp4');
    const isHeic = lowerUrl.endsWith('.heic');

    useEffect(() => {
        let active = true;
        if (isHeic) {
            fetch(url)
                .then(res => res.blob())
                .then(blob => heic2any({ blob, toType: "image/jpeg", quality: 0.8 }))
                .then(conversionResult => {
                    const finalBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
                    if (active) {
                        const newUrl = URL.createObjectURL(finalBlob);
                        setObjectUrl(newUrl);
                        setStatus('success');
                    }
                })
                .catch(err => {
                    console.error("HEIC Error:", err);
                    if (active) setStatus('error');
                });
        }
        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [url, isHeic]);

    const displaySrc = objectUrl || (item.preview_url && item.preview_url !== item.url ? item.preview_url : url);

    if (isVideo) {
        return (
            <div className={`${style.mediaContainer} ${className || ''}`} onClick={onClick}>
                <video
                    src={url}
                    className={`${style.mediaImage} ${status === 'loading' ? style.hidden : style.visible}`}
                    muted
                    loop
                    playsInline
                    autoPlay
                    onLoadedData={() => setStatus('success')}
                    onError={() => setStatus('error')}
                    style={{ objectFit: 'cover' }}
                />
                {status === 'loading' && <div className={style.skeleton} />}
                <div className={style.playOverlay}><IconPlay /></div>
                {overlay}
            </div>
        );
    }

    return (
        <div className={`${style.mediaContainer} ${className || ''}`} onClick={onClick}>
            {status === 'loading' && <div className={style.skeleton} />}
            <img
                src={displaySrc}
                alt="media"
                className={`${style.mediaImage} ${status === 'loading' ? style.hidden : style.visible}`}
                onLoad={() => setStatus('success')}
                onError={() => setStatus('error')}
            />
            {overlay}
        </div>
    );
};


const SitterPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { onAuthClick } = useOutletContext<PageContextType>();

    const [sitter, setSitter] = useState<SitterProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [clientOrders, setClientOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

    // State for simple Info Modal (Highlights explanation)
    const [infoModalData, setInfoModalData] = useState<InfoModalState | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchSitter = async () => {
            if (!id) return;
            try {
                const data = await getSitterProfile(id);
                setSitter(data);
            } catch (error) {
                console.error("Failed to load sitter", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSitter();
    }, [id]);

    const activeServices = useMemo(() =>
        sitter?.worker_services?.data?.filter((s: any) => s.is_active) || [],
        [sitter]);

    const mediaList = useMemo(() => {
        if (!sitter) return [];
        const gallery = sitter.media?.data || [];
        let slides = gallery.map((item) => {
            const url = item.url || '';
            const lowerUrl = url.toLowerCase();
            const isVideo = item.media_type === 'video' || lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.mp4');
            if (isVideo) {
                return {
                    type: "video" as const,
                    width: 1280, height: 720,
                    poster: (item.preview_url && item.preview_url !== item.url) ? item.preview_url : undefined,
                    sources: [{ src: url, type: lowerUrl.endsWith('.mov') ? 'video/quicktime' : 'video/mp4' }],
                    autoPlay: true, muted: false, controls: true, playsInline: true
                };
            }
            return { src: url };
        });
        if (slides.length === 0 && sitter.avatar?.data?.url) {
            slides = [{ src: sitter.avatar.data.url }];
        }
        return slides;
    }, [sitter]);

    const handleOfferOrderClick = async () => {
        if (!isAuthenticated) {
            onAuthClick('register', 'client');
            return;
        }
        setIsOrderModalOpen(true);
        setOrdersLoading(true);
        try {
            const res = await getMyOrders(1);
            const ordersList = res.data || (Array.isArray(res) ? res : []);
            if (Array.isArray(ordersList)) {
                setClientOrders(ordersList.filter((o: any) => o.status === 'pending_worker' || o.status === 'new'));
            }
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleInviteOrder = async (orderId: number) => {
        if (!sitter?.user_id || isInviting) return;
        setIsInviting(true);
        try {
            const res = await createOrderRequest({
                order_id: orderId, recipient_id: sitter.user_id, request_type: 'client_invite', message: ''
            });
            if (res && (res.status === 'success' || res.data)) {
                alert(t('common.inviteSent', 'Приглашение отправлено!'));
                setIsOrderModalOpen(false);
            } else {
                alert(res.message || 'Ошибка');
            }
        } catch (e: any) {
            alert(e.message || 'Ошибка');
        } finally {
            setIsInviting(false);
        }
    };

    const openInfo = (title: string, text: string) => {
        setInfoModalData({ title, text });
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className={style.spinner}></div></div>;
    if (!sitter) return <div style={{ textAlign: 'center', marginTop: 100 }}>Ситтер не найден</div>;

    const rating = Number(sitter.user_rating || 0).toFixed(1);
    const minPrice = activeServices.length > 0 ? Math.min(...activeServices.map((s: any) => s.price_per_unit)) : 0;
    const ageLabel = sitter.age ? getPluralForm(sitter.age, ['год', 'года', 'лет']) : '';

    // GRID LOGIC
    const mediaItems = sitter.media?.data || [];
    const displayMedia = mediaItems.length > 0 ? mediaItems : (sitter.avatar?.data?.url ? [{ url: sitter.avatar.data.url, id: 'avatar', media_type: 'image' }] : []);
    const count = displayMedia.length;

    let layoutClass = '';
    if (count === 1) layoutClass = style['layout-1'];
    else if (count === 2) layoutClass = style['layout-2'];
    else if (count === 3) layoutClass = style['layout-3'];
    else if (count === 4) layoutClass = style['layout-4'];
    else layoutClass = style['layout-5'];

    const visibleMedia = displayMedia.slice(0, 5);
    const moreCount = count > 5 ? count - 5 : 0;

    const renderServiceItem = (s: any) => {
        const conf = getServiceConfig(s.service_key);
        const dogSizes = s.allowedDogSizes?.data || [];
        const catSizes = s.allowedCatSizes?.data || [];

        return (
            <div key={s.service_key} className={style.serviceItem}>
                <div className={style.serviceMain}>
                    <div className={style.serviceInfo}>
                        <div className={style.iconCircle}><conf.Icon width={20} /></div>
                        <div>
                            <span className={style.serviceName}>{t(conf.label)}</span>
                            {s.max_pets && <span className={style.serviceSub}>Макс. {s.max_pets} питомцев</span>}
                        </div>
                    </div>
                    <div className={style.servicePriceBlock}>
                        <span className={style.price}>{Math.round(s.price_per_unit)} {sitter.currency_symbol}</span>
                        <span className={style.unit}>/{t(conf.unit)}</span>
                    </div>
                </div>
                <div className={style.serviceDetails}>
                    {dogSizes.length > 0 && (
                        <div className={style.sizeGroup}>
                            <span className={style.sizeLabel}>Собаки:</span>
                            {dogSizes.map((size: any) => (
                                <span key={size.id} className={style.detailTag}>{getPetSizeLabel(t, size.name)}</span>
                            ))}
                        </div>
                    )}
                    {catSizes.length > 0 && (
                        <div className={style.sizeGroup}>
                            <span className={style.sizeLabel}>Кошки:</span>
                            {catSizes.map((size: any) => (
                                <span key={size.id} className={style.detailTag}>{getPetSizeLabel(t, size.name)}</span>
                            ))}
                        </div>
                    )}
                    {s.price_per_additional_pet > 0 && (
                        <div className={style.extraPrice}>
                            + {Math.round(s.price_per_additional_pet)} {sitter.currency_symbol} за доп. питомца
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const disclaimerText = "Исполнитель может предложить другую цену в зависимости от сложности заказа. Указанные цены являются ориентировочными и не являются публичной офертой.";

    return (
        <div className={style.pageWrapper}>
            <Helmet><title>{sitter.name} | PetsOk</title></Helmet>
            <div className={style.container}>
                <div className={style.contentLayout}>

                    {/* --- LEFT SIDEBAR (STICKY) --- */}
                    <aside className={style.leftSidebar}>
                        <div className={style.profileCard}>
                            <div className={style.avatarWrapper}>
                                <img src={sitter.avatar?.data?.preview_url || sitter.avatar?.data?.url || '/placeholder-user.jpg'} alt={sitter.name} className={style.avatarImage} />
                                {sitter.is_premium && (
                                    <div className={style.premiumBadge} title="PRO Исполнитель (Подтвержден)">
                                        <IconCrown />
                                    </div>
                                )}
                            </div>
                            <div className={style.profileMeta}>
                                <div className={style.nameRow}>
                                    <h1 className={style.profileName}>{sitter.name}</h1>
                                    {sitter.is_premium && <span className={style.proLabel}><IconDiamond /> PRO Sitter</span>}
                                </div>

                                <div className={style.locationRow}>
                                    <IconMapPin /> {sitter.city?.name}
                                    {sitter.age && <span style={{ marginLeft: 6 }}>• {sitter.age} {ageLabel}</span>}
                                </div>
                                <div className={style.trustInfo}>

                                    <div className={style.trustRow}>
                                        <IconClock />
                                        <span style={{ color: sitter.is_online ? '#48bb78' : 'inherit' }}>
                                            {formatLastSeen(sitter.last_seen_at, !!sitter.is_online)}
                                        </span>
                                    </div>
                                </div>

                                <div className={style.ratingRow}>
                                    <span className={style.ratingScore}><IconStar /> {rating}</span>
                                    {sitter.reviews_count > 0 && (
                                        <span className={style.ratingCount}>({sitter.reviews_count} отзывов)</span>
                                    )}
                                </div>
                            </div>

                            <button className={style.ctaButton} onClick={handleOfferOrderClick}>Предложить заказ</button>

                            {/* Highlights Grid - CLICKABLE with EXPLANATIONS */}
                            <div className={style.highlightsGrid}>
                                <div
                                    className={style.highlightItem}
                                    onClick={() => openInfo("Личность подтверждена", "Документы исполнителя (паспорт) были проверены и подтверждены администрацией платформы. Мы гарантируем, что это реальный человек.")}
                                >
                                    <div className={`${style.iconBox} ${style.success}`}><IconShield /></div>
                                    <span>Личность подтверждена</span>
                                </div>

                                <div
                                    className={style.highlightItem}
                                    onClick={() => openInfo("Тест пройден", "Исполнитель успешно прошел внутреннее тестирование на знание правил сервиса, основ ухода за животными и техники безопасности.")}
                                >
                                    <div className={`${style.iconBox} ${style.primary}`}><IconAcademic /></div>
                                    <span>Тест пройден</span>
                                </div>

                                <div
                                    className={style.highlightItem}
                                    onClick={() => openInfo("Опыт с животными", "Количество лет, в течение которых исполнитель активно взаимодействует с животными (своими или чужими).")}
                                >
                                    <div className={style.iconBox}><IconRibbon /></div>
                                    <span>{sitter.care_experience} {getPluralForm(sitter.care_experience, ['год', 'года', 'лет'])}</span>
                                    <small>опыта с животными</small>
                                </div>

                                {sitter.repeat_order_count > 0 && (
                                    <div className={style.highlightItem} style={{ cursor: 'default' }}>
                                        <div className={style.iconBox}><IconRepeat /></div>
                                        <span>{sitter.repeat_order_count}+</span>
                                        <small>повторных</small>
                                    </div>
                                )}

                                {/* Friendlier Icons for Supervision & Kids */}
                                {sitter.constant_supervision === 1 && (
                                    <div
                                        className={style.highlightItem}
                                        onClick={() => openInfo("Постоянный присмотр", "Ваш питомец не останется один в квартире или доме. Ситтер большую часть времени присутствует дома.")}
                                    >
                                        <div className={style.iconBox}><IconHomeHeart /></div>
                                        <span>Постоянный присмотр</span>
                                    </div>
                                )}
                                {sitter.children_under_twelve_yo === 0 ? (
                                    <div
                                        className={style.highlightItem}
                                        onClick={() => openInfo("Дети в доме", "В доме исполнителя нет детей младше 12 лет, что обеспечивает спокойную обстановку для питомцев, не привыкших к детям.")}
                                    >
                                        <div className={style.iconBox}><IconChild /></div>
                                        <span>Нет детей дома до 12 лет</span>
                                    </div>
                                ) : (
                                    <div
                                        className={style.highlightItem}
                                        onClick={() => openInfo("Дети в доме", "В доме исполнителя проживают дети. Учитывайте это, если ваш питомец не ладит с детьми.")}
                                    >
                                        <div className={style.iconBox}><IconChild /></div>
                                        <span>Есть дети дома до 12 лет</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detailed Services in Sidebar for Desktop */}
                        {activeServices.length > 0 && (
                            <div className={style.servicesCard}>
                                <h3>{t('sitterPage.servicesTitle', 'Услуги')}</h3>
                                {activeServices.map(renderServiceItem)}
                                <div className={style.serviceDisclaimer}>
                                    <IconInfo width={14} height={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <p>{disclaimerText}</p>
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* --- RIGHT CONTENT --- */}
                    <div className={style.rightContent}>
                        {/* 1. GALLERY (Adaptive Grid) */}
                        <div className={`${style.galleryWrapper} ${layoutClass}`}>
                            {visibleMedia.map((item: any, i: number) => (
                                <MediaItemWithLoader
                                    key={item.id || i}
                                    item={item}
                                    className={style.photoItem}
                                    onClick={() => { setLightboxIndex(i); setIsLightboxOpen(true); }}
                                    overlay={(i === 4 && moreCount > 0) ? <div className={style.moreOverlay}>+{moreCount}</div> : null}
                                />
                            ))}
                            <button className={style.showAllBtn} onClick={() => setIsLightboxOpen(true)}>
                                <IconGrid /> Все фото
                            </button>
                        </div>

                        {/* MOBILE HEADER */}
                        <div className={style.mobileProfileHeader}>
                            <div className={style.avatarWrapper}>
                                <img src={sitter.avatar?.data?.preview_url || '/placeholder-user.jpg'} alt={sitter.name} className={style.avatarImage} />
                                {sitter.is_premium && <div className={style.premiumBadge}><IconCrown /></div>}
                            </div>
                            <div className={style.profileInfo}>
                                <div className={style.nameRow}>
                                    <h1 className={style.profileName}>{sitter.name}</h1>
                                    {sitter.is_premium && <span className={style.proLabelSmall}>PRO</span>}
                                </div>
                                <div className={style.ratingRow}>
                                    <span className={style.ratingScore}><IconStar /> {rating}</span>
                                    {sitter.reviews_count > 0 && (
                                        <span className={style.ratingCount}>({sitter.reviews_count} отзывов)</span>
                                    )}
                                </div>
                                <div className={style.locationRow}>{sitter.city?.name} • {sitter.age} {ageLabel}</div>
                            </div>
                        </div>

                        {/* 2. DESCRIPTION */}
                        <div className={style.descriptionBox}>
                            <h2 className={style.sectionHeader}>{sitter.title}</h2>
                            <div className={style.aboutText}>
                                <h2>{t('sitterPage.aboutMe', 'Обо мне')}</h2>
                                <p>{sitter.description}</p>
                            </div>
                        </div>

                        {/* 3. PETS */}
                        {sitter.pets?.data && sitter.pets.data.length > 0 && (
                            <div className={style.petsSection}>
                                <h2>{t('sitterPage.sitterPets', 'Питомцы ситтера')}</h2>
                                <div className={style.petsList}>
                                    {sitter.pets.data.map((pet: any) => (
                                        <div key={pet.id} className={style.petCard}>
                                            <div className={style.petAvatarContainer}>
                                                <img src={pet.avatar?.data?.preview_url || '/placeholder-pet.jpg'} alt={pet.name} />
                                            </div>
                                            <div className={style.petInfo}>
                                                <h4>{pet.name}</h4>
                                                <span>{pet.breed?.data?.name || 'Без породы'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. MAP (Orange Circle) */}
                        {sitter.latitude && (
                            <div className={style.mapSection}>
                                <h2>{t('sitterPage.location', 'Местоположение')}</h2>
                                <div className={style.mapContainer}>
                                    <YMaps query={{ apikey: config.yandexMapsApiKey, lang: 'ru_RU' }}>
                                        <Map
                                            defaultState={{
                                                center: [Number(sitter.latitude || 0), Number(sitter.longitude || 0)],
                                                zoom: 13,
                                                controls: []
                                            }}
                                            width="100%" height="100%"
                                        >
                                            <ZoomControl options={{ position: { right: 10, top: 50 } }} />
                                            {/* ИСПРАВЛЕНИЕ 2: parseFloat -> Number(), безопасная проверка */}
                                            <Circle
                                                geometry={[[Number(sitter.latitude || 0), Number(sitter.longitude || 0)], 500]}
                                                options={{ fillColor: 'rgba(108, 134, 219, 0.2)', strokeColor: '#3598FE', strokeWidth: 2 }}
                                            />
                                        </Map>
                                    </YMaps>
                                </div>
                                <div className={style.privacyNote}>
                                    <IconEyeOff /> <span>{t('sitterPage.mapPrivacy', 'Точный адрес будет доступен после бронирования')}</span>
                                </div>
                            </div>
                        )}

                        {/* 5. REVIEWS */}
                        {sitter.reviews_count > 0 && (
                            <div className={style.reviewsSection}>
                                <h2>{t('sitterPage.reviews', 'Отзывы')} ({sitter.reviews_count})</h2>
                                <p style={{ color: '#718096' }}>Посмотреть все отзывы можно в мобильном приложении.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Footer */}
            <div className={style.mobileFooter}>
                <div className={style.price} onClick={() => setIsServicesModalOpen(true)}>
                    <span>от <IconChevronUp width={12} /></span>
                    <strong>{Math.round(minPrice)} {sitter.currency_symbol}</strong>
                </div>
                <button className={style.bookBtn} onClick={handleOfferOrderClick}>Предложить заказ</button>
            </div>

            {/* Mobile Services Modal */}
            {isServicesModalOpen && (
                <div className={style.servicesModalOverlay} onClick={() => setIsServicesModalOpen(false)}>
                    <div className={style.servicesModalContent} onClick={e => e.stopPropagation()}>
                        <div className={style.modalHeader}>
                            <h3>{t('sitterPage.servicesTitle', 'Услуги')}</h3>
                            <button onClick={() => setIsServicesModalOpen(false)}>&times;</button>
                        </div>
                        {activeServices.map(renderServiceItem)}
                        <div className={style.serviceDisclaimer}>
                            <IconInfo width={14} height={14} style={{ flexShrink: 0, marginTop: 2 }} />
                            <p>{disclaimerText}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* INFO POPUP MODAL */}
            {infoModalData && (
                <div className={style.infoModalOverlay} onClick={() => setInfoModalData(null)}>
                    <div className={style.infoModalContent} onClick={e => e.stopPropagation()}>
                        <h3>{infoModalData.title}</h3>
                        <p>{infoModalData.text}</p>
                        <button className={style.infoModalClose} onClick={() => setInfoModalData(null)}>Понятно</button>
                    </div>
                </div>
            )}

            <Lightbox
                open={isLightboxOpen}
                close={() => setIsLightboxOpen(false)}
                index={lightboxIndex}
                slides={mediaList}
                plugins={[Video]}
                video={{ autoPlay: true, muted: false, controls: true, playsInline: true }}
            />

            <SelectOrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                orders={clientOrders}
                loading={ordersLoading}
                onSelectOrder={handleInviteOrder}
                onCreateNew={() => { setIsOrderModalOpen(false); navigate('/cabinet/orders/create', { state: { preselectedWorkerId: id } }); }}
            />
        </div>
    );
};

export default SitterPage;