// --- File: src/pages/SitterPage.tsx ---
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { YMaps, Map, ZoomControl, Circle } from '@pbe/react-yandex-maps';
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

import { getSitterProfile, SitterProfileResponse } from '../services/api';
import style from '../style/pages/SitterPage.module.scss';

// Импорт иконок услуг
import BoardingIcon from '../components/icons/BoardingIcon';
import DogWalkingIcon from '../components/icons/DogWalkingIcon';
import DropInVisitsIcon from '../components/icons/DropInVisitsIcon';
import DoggyDayCareIcon from '../components/icons/DoggyDayCareIcon';
import HouseSittingIcon from '../components/icons/HouseSittingIcon';

// --- SVG Иконки ---
const IconStarGold = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFC107"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>;
const IconGoldShield = () => (
    <svg width="28" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill="#FFC107" />
        <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="#231F20" />
    </svg>
);

const IconGrid = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconPlay = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}><path d="M8 5v14l11-7z" /></svg>;
const IconEyeOff = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
const IconIdCard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 8h2" /><path d="M15 12h2" /><path d="M7 16h10" /></svg>;
const IconPhoneCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /><path d="M16 3l1.5 1.5 3.5-3.5" stroke="#34C759" /></svg>;
const IconDiploma = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>;

const getServiceConfig = (key: string) => {
    const configs: Record<string, { label: string; desc: string; Icon: React.FC<any> }> = {
        'boarding': { label: 'Передержка', desc: 'у ситтера дома', Icon: BoardingIcon },
        'walking': { label: 'Выгул', desc: 'в вашем районе', Icon: DogWalkingIcon },
        'drop_in_visit': { label: 'Визиты', desc: 'к вам домой', Icon: DropInVisitsIcon },
        'doggy_day_care': { label: 'Дневная няня', desc: 'у ситтера дома', Icon: DoggyDayCareIcon },
        'house_sitting': { label: 'Присмотр', desc: 'в вашем доме', Icon: HouseSittingIcon }
    };
    return configs[key] || { label: key, desc: 'Услуга', Icon: BoardingIcon };
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
    const [sitter, setSitter] = useState<SitterProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

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

    useEffect(() => {
        const header = document.querySelector('header');
        if (header) header.classList.add('force-light-header');
        return () => { if (header) header.classList.remove('force-light-header'); };
    }, []);

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

    const galleryItems = (sitter?.media?.data || []).slice(0, 5);
    const mainMedia = galleryItems[0];
    const subMedia = galleryItems.slice(1, 5);
    const totalMediaCount = sitter?.media?.data?.length || 0;
    const moreCount = totalMediaCount > 5 ? totalMediaCount - 5 : 0;

    if (loading) return <div className={style.loadingState}>Загрузка...</div>;
    if (!sitter) return <div className={style.errorState}>Ситтер не найден</div>;

    const minPrice = activeServices.length > 0
        ? Math.min(...activeServices.map((s: any) => s.price_per_unit))
        : 0;

    const countryName = typeof sitter.country === 'object'
        ? (sitter.country as any).name
        : (sitter.country || 'RU');

    return (
        <div className={style.pageWrapper}>
            <Helmet>
                <title>{sitter.name} - PetsOk</title>
                <meta name="description" content={sitter.title} />
            </Helmet>

            <div className={style.container}>
                <div className={style.contentLayout}>
                    <aside className={style.leftSidebar}>
                        <div className={style.profileCard}>
                            <div className={style.avatarCenteredWrapper}>
                                <div className={style.avatarBox}>
                                    <img src={sitter.avatar?.data?.url || '/placeholder.jpg'} alt={sitter.name} />
                                    <div className={style.shieldBadge}>
                                        <IconGoldShield />
                                    </div>
                                </div>
                            </div>
                            <div className={style.profileInfoCentered}>
                                <h1 className={style.profileName}>{sitter.name}</h1>
                                <p className={style.profileLocation}>
                                    {sitter.city?.name}, {countryName}
                                </p>
                                <div className={style.profileRatingRow}>
                                    <IconStarGold />
                                    <span className={style.ratingScore}>{Number(sitter.user_rating).toFixed(1)}</span>
                                    <span className={style.ratingDot}>•</span>
                                    <span className={style.ratingReviews}>{sitter.reviews_count} reviews</span>
                                </div>
                            </div>
                            <button className={style.ctaButton}>
                                Предложить заказ
                            </button>
                            <div className={style.verificationBlock}>
                                <div className={style.verificationItem}>
                                    <div className={style.iconBox}><IconIdCard /></div>
                                    <span>Личность подтверждена</span>
                                </div>
                                <div className={style.verificationItem}>
                                    <div className={style.iconBox}><IconPhoneCheck /></div>
                                    <span>Телефон подтвержден</span>
                                </div>
                                <div className={style.verificationItem}>
                                    <div className={style.iconBox}><IconDiploma /></div>
                                    <span>Тест пройден</span>
                                </div>
                            </div>
                        </div>

                        {activeServices.length > 0 && (
                            <div className={style.servicesCard}>
                                <h3>Услуги</h3>
                                <div className={style.servicesList}>
                                    {activeServices.map((s: any) => {
                                        const config = getServiceConfig(s.service_key);
                                        return (
                                            <div key={s.service_key} className={style.serviceRow}>
                                                <div className={style.serviceIconWrapper}>
                                                    <config.Icon width={24} height={24} color="currentColor" />
                                                </div>
                                                <div className={style.serviceInfo}>
                                                    <span className={style.serviceTitle}>{config.label}</span>
                                                    <span className={style.serviceDesc}>{config.desc}</span>
                                                </div>
                                                <div className={style.servicePriceBlock}>
                                                    <span className={style.priceLabel}>от</span>
                                                    <span className={style.priceValue}>
                                                        {Math.round(s.price_per_unit)} {sitter.currency_symbol}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </aside>

                    <div className={style.rightContent}>
                        <div className={style.gallerySection}>
                            <div className={style.mainMediaContainer}>
                                {mainMedia ? (
                                    <GalleryItem
                                        item={mainMedia}
                                        onClick={() => { setLightboxIndex(0); setIsLightboxOpen(true); }}
                                    />
                                ) : (
                                    <div className={style.mediaWrapper} onClick={() => { setLightboxIndex(0); setIsLightboxOpen(true); }}>
                                        <img src={sitter.avatar?.data?.url || '/placeholder.jpg'} alt="Avatar" className={style.photoImage} />
                                    </div>
                                )}
                            </div>
                            {subMedia.map((item, i) => (
                                <div key={item.id} className={style.subMediaItem}>
                                    <GalleryItem
                                        item={item}
                                        onClick={() => { setLightboxIndex(i + 1); setIsLightboxOpen(true); }}
                                    />
                                    {i === 3 && (moreCount > 0 || totalMediaCount > 5) && (
                                        <div
                                            className={style.viewAllOverlay}
                                            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                                        >
                                            <IconGrid />
                                            <span>+{totalMediaCount - 5} фото</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {subMedia.length < 4 && Array.from({ length: 4 - subMedia.length }).map((_, i) => (
                                <div key={`empty-${i}`} className={style.subMediaItemEmpty}></div>
                            ))}
                            <button className={style.mobileShowAllBtn} onClick={() => setIsLightboxOpen(true)}>
                                <IconGrid /> Все фото
                            </button>
                        </div>

                        <div className={style.headlineSection}>
                            <h1>{sitter.title}</h1>
                            <div className={style.aboutSection}>
                                <h2>Обо мне</h2>
                                <p className={style.descriptionText}>{sitter.description}</p>
                            </div>
                        </div>

                        {/* --- ИСПРАВЛЕНИЕ: Добавлены Optional Chaining и проверка на длину --- */}
                        {sitter.pets?.data && sitter.pets.data.length > 0 && (
                            <div className={`${style.petsSection} ${style.contentSection}`}>
                                <h2>Питомцы ситтера</h2>
                                <div className={style.petsGrid}>
                                    {sitter.pets.data.map((pet: any) => (
                                        <div key={pet.id} className={style.petCard}>
                                            <img src={pet.avatar?.data?.preview_url || pet.avatar?.data?.url} alt={pet.name} />
                                            <div className={style.petName}>{pet.name}</div>
                                            <div className={style.petBreed}>{pet.breed_name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {sitter.latitude && sitter.longitude && (
                            <div className={`${style.mapSection} ${style.contentSection}`}>
                                <h2>Местоположение</h2>
                                <div className={style.mapWrapper}>
                                    <YMaps query={{ lang: 'ru_RU' }}>
                                        <Map
                                            key={sitter.user_id}
                                            defaultState={{
                                                center: [parseFloat(sitter.latitude as any), parseFloat(sitter.longitude as any)],
                                                zoom: 13,
                                                controls: []
                                            }}
                                            width="100%"
                                            height="100%"
                                            className={style.yandexMapInstance}
                                        >
                                            <ZoomControl options={{ position: { right: 10, top: 50 } }} />
                                            <Circle
                                                geometry={[
                                                    [parseFloat(sitter.latitude as any), parseFloat(sitter.longitude as any)],
                                                    500
                                                ]}
                                                options={{
                                                    draggable: false,
                                                    fillColor: 'rgba(53, 152, 254, 0.2)',
                                                    strokeColor: '#3598FE',
                                                    strokeWidth: 2,
                                                    strokeOpacity: 0.8
                                                }}
                                            />
                                        </Map>
                                    </YMaps>
                                </div>
                                <div className={style.mapPrivacyText}>
                                    <IconEyeOff /> <span>Точный адрес будет доступен после бронирования</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={style.mobileFooter}>
                <div className={style.mobilePrice}>
                    <span className={style.val}>от {Math.round(minPrice)} {sitter.currency_symbol}</span>
                </div>
                <button className={style.mobileBookBtn}>Предложить заказ</button>
            </div>

            <Lightbox
                open={isLightboxOpen}
                close={() => setIsLightboxOpen(false)}
                index={lightboxIndex}
                slides={mediaList}
                plugins={[Video]}
                video={{ autoPlay: true, muted: false, controls: true }}
            />
        </div>
    );
};

export default SitterPage;