import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import style from '../../style/components/search/SitterCardWeb.module.scss';

// SVG Иконки
const StarIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFC107"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>;
const CrownIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>;
const LocationIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const VerifiedShield = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 4, display: 'inline-block', verticalAlign: 'middle' }}><path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill="#3598FE" /><path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white" /></svg>;
const PawIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.15"><path d="M17.65 6.35C16.2 7.8 14.2 7.8 12.75 6.35C11.3 4.9 11.3 2.9 12.75 1.45C14.2 0 16.2 0 17.65 1.45C19.1 2.9 19.1 4.9 17.65 6.35ZM6.35 6.35C7.8 4.9 7.8 2.9 6.35 1.45C4.9 0 2.9 0 1.45 1.45C0 2.9 0 4.9 1.45 6.35C2.9 7.8 4.9 7.8 6.35 6.35ZM22.55 1.45C21.1 0 19.1 0 17.65 1.45C16.2 2.9 16.2 4.9 17.65 6.35C19.1 7.8 21.1 7.8 22.55 6.35C24 4.9 24 2.9 22.55 1.45ZM1.45 12.55C2.9 11.1 4.9 11.1 6.35 12.55C7.8 14 7.8 16 6.35 17.45C4.9 18.9 2.9 18.9 1.45 17.45C0 16 0 14 1.45 12.55ZM12 9C9.24 9 7 11.24 7 14C7 16.76 9.24 19 12 19C14.76 19 17 16.76 17 14C17 11.24 14.76 9 12 9ZM12 24C9.24 24 7 21.76 7 19H17C17 21.76 14.76 24 12 24Z" /></svg>;
const HeartIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>;

interface SitterCardProps {
    data: any;
    isHovered?: boolean;
    onHover?: () => void;
    onLeave?: () => void;
}

const SitterCardWeb: React.FC<SitterCardProps> = ({ data, isHovered, onHover, onLeave }) => {
    const { t } = useTranslation();

    const avatarUrl = data.avatar?.data?.preview_url || data.avatar?.data?.url;
    // Берем обложку: медиа -> основное фото -> аватар -> заглушка
    const coverImageUrl = data.media?.data?.[0]?.url || data.img || avatarUrl;

    const priceDisplay = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: data.currency_code || 'RUB',
        maximumFractionDigits: 0
    }).format(data.service_price || data.price || 0);

    // Логика отображения локации
    const locationName = data.address || data.city?.name;
    const distanceText = data.distance_km
        ? `~${Number(data.distance_km).toFixed(1)} ${t('common.km', 'км')}`
        : null;

    return (
        <Link
            to={`/sitter/${data.id}`}
            className={`${style.card} ${isHovered ? style.cardHovered : ''} ${data.is_premium ? style.cardPremium : ''}`}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            {/* --- ЛЕВАЯ ЧАСТЬ: ТОЛЬКО ФОТО (Компактная) --- */}
            <div className={style.coverWrapper}>
                {coverImageUrl ? (
                    <img src={coverImageUrl} alt={data.name} className={style.coverImage} loading="lazy" />
                ) : (
                    <div className={style.placeholderImage}><PawIcon /></div>
                )}

                {/* Бейдж PRO сверху */}
                {data.is_premium && (
                    <div className={style.proBadge}>
                        <CrownIcon /> <span>PRO</span>
                    </div>
                )}

                {data.is_online && <div className={style.onlineStatus} />}
            </div>

            {/* --- ПРАВАЯ ЧАСТЬ: ИНФО (Компактная) --- */}
            <div className={style.contentWrapper}>

                {/* 1. Верх: Имя и Рейтинг */}
                <div className={style.headerRow}>
                    <div className={style.nameCol}>
                        <div className={style.nameRow}>
                            <h3 className={style.name}>{data.name}</h3>
                            <VerifiedShield />
                        </div>

                        {(locationName || distanceText) && (
                            <p className={style.address}>
                                <LocationIcon />
                                {locationName}
                                {locationName && distanceText && <span className={style.distance}> • </span>}
                                {distanceText && <span className={style.distance}>{distanceText}</span>}
                            </p>
                        )}
                    </div>

                    <div className={style.ratingBadge}>
                        <StarIcon />
                        <span className={style.ratingValue}>{Number(data.user_rating || 0).toFixed(1)}</span>
                        <span className={style.reviewsCount}>({data.reviews_count || 0})</span>
                    </div>
                </div>

                {/* 2. Заголовок */}
                <h4 className={style.title}>{data.title}</h4>

                {/* 3. Описание */}
                <p className={style.description}>
                    {data.description ? (
                        data.description.length > 90 ? data.description.substring(0, 90) + '...' : data.description
                    ) : (
                        t('sitterCard.noDescription', '')
                    )}
                </p>

                {/* 4. Низ: Теги и Цена */}
                <div className={style.footerRow}>
                    <div className={style.tags}>
                        {data.repeat_order_count > 0 && (
                            <span className={style.tagHighlight}>
                                <HeartIcon /> {data.repeat_order_count} {t('sitterCard.repeat_clients', 'повторных')}
                            </span>
                        )}
                    </div>

                    <div className={style.priceBlock}>
                        <span className={style.priceLabel}>{t('common.from', 'от')}</span>
                        <span className={style.priceValue}>{priceDisplay}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default SitterCardWeb;