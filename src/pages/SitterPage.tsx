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

// SVG Icons
const IconStar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>;
const IconGrid = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconMapPin = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconCrown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>;
const IconEyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const IconPlay = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}><path d="M8 5v14l11-7z" /></svg>;

// --- ИСПРАВЛЕНИЕ: Добавлена поддержка пропсов для изменения размера ---
const IconChevronUp = (props: React.SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M18 15l-6-6-6 6" /></svg>;

// --- Интерфейс для контекста (получаем функцию открытия модалки из Layout) ---
interface PageContextType {
    onAuthClick: (mode: 'login' | 'register', type?: 'client' | 'sitter') => void;
}

// Config for services
const getServiceConfig = (key: string) => {
    const configs: Record<string, { label: string; Icon: React.FC<any> }> = {
        'boarding': { label: 'Передержка', Icon: BoardingIcon },
        'walking': { label: 'Выгул', Icon: DogWalkingIcon },
        'drop_in_visit': { label: 'Визиты', Icon: DropInVisitsIcon },
        'doggy_day_care': { label: 'Дневная няня', Icon: DoggyDayCareIcon },
        'house_sitting': { label: 'Присмотр дома', Icon: HouseSittingIcon }
    };
    return configs[key] || { label: key, Icon: BoardingIcon };
};

const GalleryItem: React.FC<{ item: any; onClick: () => void }> = ({ item, onClick }) => {
    if (item.media_type === 'video') {
        return (
            <div className={style.mediaWrapper} onClick={onClick}>
                <div className={style.videoContainer}>
                    <img src={item.preview_url || item.url} alt="background blur" className={style.videoBlurBg} />
                    <video
                        src={item.url}
                        poster={item.preview_url}
                        autoPlay muted loop playsInline
                        className={style.videoElement}
                    />
                    <div className={style.playIconOverlay}><IconPlay /></div>
                </div>
            </div>
        );
    }
    return (
        <div className={style.mediaWrapper} onClick={onClick}>
            <img src={item.url} alt="Gallery item" className={style.photoImage} />
        </div>
    );
};

const SitterPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    // --- Получаем функцию открытия модалки ---
    const { onAuthClick } = useOutletContext<PageContextType>();

    const [sitter, setSitter] = useState<SitterProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Order Logic State
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [clientOrders, setClientOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    // Services Modal State (Mobile Web)
    const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

    // Принудительно светлый хедер
    useEffect(() => {
        const header = document.querySelector('header');
        if (header) header.classList.add('force-light-header');
        return () => { if (header) header.classList.remove('force-light-header'); };
    }, []);

    useEffect(() => {
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
            if (item.media_type === 'video') {
                return {
                    type: "video" as const,
                    width: 1280,
                    height: 720,
                    poster: item.preview_url,
                    sources: [{ src: item.url, type: "video/mp4" }]
                };
            }
            return { src: item.url };
        });
        if (slides.length === 0 && sitter.avatar?.data?.url) {
            slides = [{ src: sitter.avatar.data.url }];
        }
        return slides;
    }, [sitter]);

    // --- ЛОГИКА "ПРЕДЛОЖИТЬ ЗАКАЗ" ---

    // 1. Клик по кнопке "Предложить заказ"
    const handleOfferOrderClick = async () => {
        if (!isAuthenticated) {
            // Если не авторизован - открываем модалку
            onAuthClick('register', 'client');
            return;
        }

        // Если авторизован - открываем модалку выбора заказа
        setIsOrderModalOpen(true);
        setOrdersLoading(true);

        try {
            const res = await getMyOrders(1);

            // --- ИСПРАВЛЕНИЕ: Безопасное извлечение массива данных ---
            // API возвращает объект { data: [...], meta: ... }, status может не быть
            const ordersList = res.data || (Array.isArray(res) ? res : []);

            if (Array.isArray(ordersList)) {
                // Фильтруем только ожидающие (pending_worker) или новые (new), если они есть
                const pending = ordersList.filter((o: any) => o.status === 'pending_worker' || o.status === 'new');
                setClientOrders(pending);
            }
        } catch (e) {
            console.error("Failed to load client orders", e);
        } finally {
            setOrdersLoading(false);
        }
    };

    // 2. Выбор существующего заказа (Инвайт)
    const handleInviteOrder = async (orderId: number) => {
        if (!sitter?.user_id) return alert("ID ситтера не найден");
        if (isInviting) return;

        setIsInviting(true);
        try {
            const payload = {
                order_id: orderId,
                recipient_id: sitter.user_id,
                request_type: 'client_invite',
                message: ''
            };

            const res = await createOrderRequest(payload);

            if (res && (res.status === 'success' || res.data)) {
                alert(t('common.inviteSent', 'Приглашение успешно отправлено!'));
                setIsOrderModalOpen(false);
            } else {
                alert(res.message || t('common.error', 'Ошибка'));
            }
        } catch (e: any) {
            console.error(e);
            alert(e.message || t('common.error', 'Ошибка'));
        } finally {
            setIsInviting(false);
        }
    };

    // 3. Создание нового заказа (переход)
    const handleCreateNewOrder = () => {
        setIsOrderModalOpen(false);
        navigate('/cabinet/orders/create', { state: { preselectedWorkerId: id } });
    };


    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('loading')}</div>;
    if (!sitter) return <div style={{ textAlign: 'center', marginTop: 100 }}>Ситтер не найден</div>;

    // --- БЕЗОПАСНАЯ ЛОГИКА ЛОКАЦИИ ---
    const city = sitter.city?.name || '';
    const country = typeof sitter.country === 'object' ? sitter.country?.name : (sitter.country || '');
    const locationString = [city, country].filter(Boolean).join(', ') || t('common.unknownLocation', 'Локация не указана');

    const rating = Number(sitter.user_rating || 0).toFixed(1);
    const minPrice = activeServices.length > 0 ? Math.min(...activeServices.map((s: any) => s.price_per_unit)) : 0;

    // --- Grid Logic ---
    const mediaItems = sitter.media?.data || [];
    const displayMedia = mediaItems.length > 0 ? mediaItems : (sitter.avatar?.data?.url ? [{ url: sitter.avatar.data.url, id: 'avatar' }] : []);
    const count = displayMedia.length;
    let layoutClass = style['layout-1'];
    if (count === 2) layoutClass = style['layout-2'];
    else if (count === 3) layoutClass = style['layout-3'];
    else if (count === 4) layoutClass = style['layout-4'];
    else if (count >= 5) layoutClass = '';
    const visibleMedia = displayMedia.slice(0, 5);
    const moreCount = count > 5 ? count - 5 : 0;

    return (
        <div className={style.pageWrapper}>
            <Helmet>
                <title>{sitter.name} | PetsOk</title>
            </Helmet>

            <div className={style.container}>
                <div className={style.contentLayout}>

                    {/* --- LEFT SIDEBAR (Sticky) - VISIBLE ONLY ON DESKTOP --- */}
                    <aside className={style.leftSidebar}>
                        <div className={style.profileCard}>
                            <div className={style.avatarWrapper}>
                                <img
                                    src={sitter.avatar?.data?.preview_url || sitter.avatar?.data?.url || '/placeholder-user.jpg'}
                                    alt={sitter.name}
                                    className={style.avatarImage}
                                />
                                {sitter.is_premium && <div className={style.premiumBadge} title="Premium"><IconCrown /></div>}
                            </div>

                            <div className={style.profileMeta}>
                                <h1 className={style.profileName}>{sitter.name}</h1>
                                <div className={style.ratingRow}>
                                    <span className={style.ratingScore}><IconStar /> {rating}</span>
                                    <span className={style.ratingCount}>({sitter.reviews_count} отзывов)</span>
                                </div>
                                <div className={style.locationRow}>
                                    <IconMapPin /> {locationString}
                                </div>
                            </div>

                            <button className={style.ctaButton} onClick={handleOfferOrderClick}>
                                {t('sitterPage.offerOrder', 'Предложить заказ')}
                            </button>

                            <div className={style.verifiedList}>
                                <div className={style.verifiedItem}>
                                    <IconCheck /> <span>Личность подтверждена</span>
                                </div>
                                <div className={style.verifiedItem}>
                                    <IconCheck /> <span>Телефон подтвержден</span>
                                </div>
                            </div>
                        </div>

                        {/* Список услуг */}
                        {activeServices.length > 0 && (
                            <div className={style.servicesCard}>
                                <h3>{t('sitterPage.servicesTitle', 'Услуги')}</h3>
                                {activeServices.map((s: any) => {
                                    const conf = getServiceConfig(s.service_key);
                                    return (
                                        <div key={s.service_key} className={style.serviceItem}>
                                            <div className={style.serviceLeft}>
                                                <div className={style.iconCircle}><conf.Icon width={22} /></div>
                                                <span>{t(conf.label)}</span>
                                            </div>
                                            <div className={style.servicePrice}>
                                                <small>от</small> {Math.round(s.price_per_unit)} {sitter.currency_symbol}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </aside>

                    {/* --- RIGHT CONTENT --- */}
                    <div className={style.rightContent}>

                        {/* 1. ГАЛЕРЕЯ */}
                        <div className={`${style.galleryWrapper} ${layoutClass}`}>
                            {visibleMedia.map((item: any, i: number) => (
                                <div key={i} className={style.photoItem} onClick={() => { setLightboxIndex(i); setIsLightboxOpen(true); }}>
                                    {item.media_type === 'video' ? (
                                        <video src={item.url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={item.url} alt="Gallery" />
                                    )}
                                    {i === 4 && moreCount > 0 && (
                                        <div className={style.moreOverlay}>+{moreCount}</div>
                                    )}
                                </div>
                            ))}
                            <button className={style.showAllBtn} onClick={() => setIsLightboxOpen(true)}>
                                <IconGrid /> Все фото
                            </button>
                        </div>

                        {/* === MOBILE PROFILE HEADER (Visible ONLY on Mobile, right after Gallery) === */}
                        <div className={style.mobileProfileHeader}>
                            <div className={style.avatarWrapper}>
                                <img
                                    src={sitter.avatar?.data?.preview_url || sitter.avatar?.data?.url || '/placeholder-user.jpg'}
                                    alt={sitter.name}
                                    className={style.avatarImage}
                                />
                                {sitter.is_premium && <div className={style.premiumBadge} title="Premium"><IconCrown /></div>}
                            </div>

                            <div className={style.profileInfo}>
                                <h1 className={style.profileName}>{sitter.name}</h1>
                                <div className={style.ratingRow}>
                                    <span className={style.ratingScore}><IconStar /> {rating}</span>
                                    <span className={style.ratingCount}>({sitter.reviews_count} отзывов)</span>
                                </div>
                                <div className={style.locationRow}>
                                    <IconMapPin /> {locationString}
                                </div>
                            </div>
                        </div>

                        {/* 2. ОПИСАНИЕ */}
                        <div className={style.descriptionBox}>
                            <h2 className={style.sectionHeader}>{sitter.title}</h2>
                            <div className={style.aboutText}>
                                <h2>{t('sitterPage.aboutMe', 'Обо мне')}</h2>
                                <p>{sitter.description}</p>
                            </div>
                        </div>

                        {/* 3. ПИТОМЦЫ СИТТЕРА */}
                        {sitter.pets?.data && sitter.pets.data.length > 0 && (
                            <div className={style.petsSection}>
                                <h2>{t('sitterPage.sitterPets', 'Питомцы ситтера')}</h2>
                                <div className={style.petsList}>
                                    {sitter.pets.data.map((pet: any) => (
                                        <div key={pet.id} className={style.petCard}>
                                            <img src={pet.avatar?.data?.preview_url || '/placeholder-pet.jpg'} alt={pet.name} />
                                            <h4>{pet.name}</h4>
                                            <span>{pet.breed?.data?.name || 'Без породы'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. КАРТА */}
                        {sitter.latitude && sitter.longitude && (
                            <div className={style.mapSection}>
                                <h2>{t('sitterPage.location', 'Местоположение')}</h2>
                                <div className={style.mapContainer}>
                                    <YMaps query={{ lang: 'ru_RU' }}>
                                        <Map
                                            defaultState={{ center: [parseFloat(sitter.latitude as any), parseFloat(sitter.longitude as any)], zoom: 13, controls: [] }}
                                            width="100%" height="100%"
                                        >
                                            <ZoomControl options={{ position: { right: 10, top: 50 } }} />
                                            <Circle
                                                geometry={[[parseFloat(sitter.latitude as any), parseFloat(sitter.longitude as any)], 500]}
                                                options={{ fillColor: 'rgba(53, 152, 254, 0.2)', strokeColor: '#3598FE', strokeWidth: 2 }}
                                            />
                                        </Map>
                                    </YMaps>
                                </div>
                                <div className={style.privacyNote}>
                                    <IconEyeOff /> <span>{t('sitterPage.mapPrivacy', 'Точный адрес будет доступен после бронирования')}</span>
                                </div>
                            </div>
                        )}

                        {/* 5. ОТЗЫВЫ */}
                        {sitter.reviews_count > 0 && (
                            <div className={style.reviewsSection}>
                                <h2>{t('sitterPage.reviews', 'Отзывы')} ({sitter.reviews_count})</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <p style={{ color: '#718096' }}>Отзывы можно просмотреть в мобильном приложении.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Footer */}
            <div className={style.mobileFooter}>
                <div className={style.price} onClick={() => setIsServicesModalOpen(true)}>
                    <span>от <IconChevronUp width={12} /></span>
                    <strong>{Math.round(minPrice)} {sitter.currency_symbol}</strong>
                </div>
                <button className={style.bookBtn} onClick={handleOfferOrderClick}>
                    Предложить заказ
                </button>
            </div>

            {/* Services Modal (Mobile Web) */}
            {isServicesModalOpen && (
                <div className={style.servicesModalOverlay} onClick={() => setIsServicesModalOpen(false)}>
                    <div className={style.servicesModalContent} onClick={e => e.stopPropagation()}>
                        <div className={style.modalHeader}>
                            <h3>{t('sitterPage.servicesTitle', 'Услуги')}</h3>
                            <button onClick={() => setIsServicesModalOpen(false)}>&times;</button>
                        </div>
                        {activeServices.length > 0 ? (
                            activeServices.map((s: any) => {
                                const conf = getServiceConfig(s.service_key);
                                return (
                                    <div key={s.service_key} className={style.serviceItem}>
                                        <div className={style.serviceLeft}>
                                            <div className={style.iconCircle}><conf.Icon width={22} /></div>
                                            <span>{t(conf.label)}</span>
                                        </div>
                                        <div className={style.servicePrice}>
                                            <small>от</small> {Math.round(s.price_per_unit)} {sitter.currency_symbol}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{ textAlign: 'center', color: '#718096' }}>Нет активных услуг</p>
                        )}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            <Lightbox
                open={isLightboxOpen}
                close={() => setIsLightboxOpen(false)}
                index={lightboxIndex}
                slides={mediaList}
                plugins={[Video]}
                video={{ autoPlay: true, muted: false, controls: true }}
            />

            {/* Modal Select Order */}
            <SelectOrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                orders={clientOrders}
                loading={ordersLoading}
                onSelectOrder={handleInviteOrder}
                onCreateNew={handleCreateNewOrder}
            />
        </div>
    );
};

export default SitterPage;