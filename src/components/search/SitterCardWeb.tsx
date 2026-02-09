import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import style from '../../style/components/search/SitterCardWeb.module.scss';

// SVG Иконки
const IconQuote = () => <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor"><path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z" /></svg>;
const IconStar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>;
const IconPaw = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.3"><path d="M17.65 6.35C16.2 7.8 14.2 7.8 12.75 6.35C11.3 4.9 11.3 2.9 12.75 1.45C14.2 0 16.2 0 17.65 1.45C19.1 2.9 19.1 4.9 17.65 6.35ZM6.35 6.35C7.8 4.9 7.8 2.9 6.35 1.45C4.9 0 2.9 0 1.45 1.45C0 2.9 0 4.9 1.45 6.35C2.9 7.8 4.9 7.8 6.35 6.35ZM22.55 1.45C21.1 0 19.1 0 17.65 1.45C16.2 2.9 16.2 4.9 17.65 6.35C19.1 7.8 21.1 7.8 22.55 6.35C24 4.9 24 2.9 22.55 1.45ZM1.45 12.55C2.9 11.1 4.9 11.1 6.35 12.55C7.8 14 7.8 16 6.35 17.45C4.9 18.9 2.9 18.9 1.45 17.45C0 16 0 14 1.45 12.55ZM12 9C9.24 9 7 11.24 7 14C7 16.76 9.24 19 12 19C14.76 19 17 16.76 17 14C17 11.24 14.76 9 12 9ZM12 24C9.24 24 7 21.76 7 19H17C17 21.76 14.76 24 12 24Z" /></svg>;
const IconLocation = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconHeart = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const IconCrownSmall = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>;

// Словарь для перевода единиц измерения
const unitTranslations: Record<string, string> = {
    'night': 'ночь',
    'visit': 'визит',
    'walk_60': 'прогулка',
    'walk_30': 'прогулка',
    'day': 'день',
    'hour': 'час',
    'unit': 'услуга'
};

interface SitterCardProps {
    data: any;
    isHovered?: boolean;
    onHover?: () => void;
    onLeave?: () => void;
}

const SitterCardWeb: React.FC<SitterCardProps> = ({ data, onHover, onLeave }) => {
    const { t, i18n } = useTranslation();

    const {
        name,
        title,
        user_rating,
        reviews_count,
        repeat_order_count,
        service_price,
        service_price_unit,
        currency_code,
        currency_symbol,
        is_premium,
        distance_km,
        id,
        avatar,
        last_review // Извлекаем последний отзыв
    } = data;

    // Аватар
    const avatarUri = avatar?.data?.preview_url || avatar?.data?.url;

    // Рейтинг
    const ratingValue = user_rating ? parseFloat(user_rating) : 0;
    const displayRating = ratingValue > 0
        ? ratingValue.toFixed(1)
        : t('common.noRatingShort', '—');

    // Текст кол-ва отзывов
    let reviewTextToDisplay = '';
    if (reviews_count > 0) {
        reviewTextToDisplay = `(${reviews_count})`;
    }

    // Цена
    const finalCurrencySymbol = currency_symbol || (currency_code === 'RUB' ? '₽' : currency_code);
    let priceDisplay = t('sitterCard.price_on_request', 'По запросу');
    let priceLabel = '';

    if (service_price !== null && service_price !== undefined) {
        const unitKey = `SERVICE_UNIT_${(service_price_unit || '').toUpperCase()}`;
        let translatedUnit = t(unitKey, { defaultValue: '' });
        if (!translatedUnit && service_price_unit) {
            translatedUnit = unitTranslations[service_price_unit] || service_price_unit;
        }
        const unitText = translatedUnit ? ` / ${translatedUnit}` : '';
        const priceFormatted = new Intl.NumberFormat(i18n.language, {
            minimumFractionDigits: currency_code === 'RUB' ? 0 : 2,
            maximumFractionDigits: currency_code === 'RUB' ? 0 : 2,
        }).format(service_price);

        priceDisplay = `${priceFormatted} ${finalCurrencySymbol}${unitText}`;
        priceLabel = t('sitterCard.price_from_label', 'от ');
    }

    return (
        <div className={`${style.cardShadowContainer} ${is_premium ? style.premium : ''}`}>
            <Link
                to={`/sitter/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${style.card} ${is_premium ? style.premiumBorder : ''}`}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
            >
                {/* Бейдж PRO */}
                {is_premium && (
                    <div className={style.premiumBanner}>
                        <IconCrownSmall />
                        <span className={style.premiumBannerText}>
                            {t('common.pro', 'PRO')}
                        </span>
                    </div>
                )}

                {/* Основной контент */}
                <div className={style.mainContent}>
                    {/* Аватар */}
                    <div className={style.avatarWrapper}>
                        {avatarUri ? (
                            <img src={avatarUri} alt={name} className={style.avatarImage} loading="lazy" />
                        ) : (
                            <div className={style.avatarPlaceholder}>
                                <IconPaw />
                            </div>
                        )}
                    </div>

                    {/* Описание */}
                    <div className={style.descriptionContainer}>
                        <h3 className={style.name} title={name}>
                            {name || t('sitter_name_placeholder', 'Имя не указано')}
                        </h3>

                        {title && (
                            <p className={style.titleText} title={title}>
                                {title}
                            </p>
                        )}

                        <div className={style.ratingAndDistanceContainer}>
                            <div className={style.ratingContainer}>
                                <IconStar />
                                <span className={style.ratingText}>{displayRating}</span>
                                <span className={style.reviewsCountText}>{reviewTextToDisplay}</span>
                            </div>

                            {distance_km !== null && distance_km !== undefined && (
                                <div className={style.distanceContainer}>
                                    <IconLocation />
                                    <span className={style.distanceText}>
                                        ~{Number(distance_km).toFixed(1)} {t('common.km', 'км')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {repeat_order_count > 0 && (
                            <div className={style.infoRow}>
                                <IconHeart />
                                <span className={style.infoText}>
                                    {t('sitterCard.repeat_clients', { count: repeat_order_count, defaultValue: `${repeat_order_count} повторных` })}
                                </span>
                            </div>
                        )}

                        {/* --- БЛОК ПОСЛЕДНЕГО ОТЗЫВА --- */}
                        {last_review && (
                            <div className={style.reviewBlock}>
                                <div className={style.reviewHeader}>
                                    <IconQuote />
                                    <span className={style.reviewLabel}>
                                        {t('sitterCard.last_review', 'Последний отзыв')}
                                    </span>
                                </div>
                                <div className={style.reviewContent}>
                                    <p className={style.reviewText}>
                                        {last_review.text}
                                    </p>
                                    <span className={style.reviewAuthor}>
                                        — {last_review.author?.name || t('common.user', 'Пользователь')}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* ------------------------------- */}
                    </div>
                </div>

                {/* Цена (Footer) */}
                <div className={style.priceSection}>
                    {priceLabel && <span className={style.priceLabel}>{priceLabel}</span>}
                    <span className={style.priceValue}>{priceDisplay}</span>
                </div>
            </Link>
        </div>
    );
};

export default SitterCardWeb;