import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import style from '../../style/components/search/SitterCardWeb.module.scss';

// SVG Иконки, адаптированные под дизайн
const CrownIcon = () => <svg viewBox="0 0 576 512" fill="currentColor"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-88.9-173.4c-4.3-8.4-15.6-8.4-19.8 0L120.2 351.6c-4.7 9.1 1.9 20.4 12.2 20.4h191.2c10.3 0 16.9-11.3 12.2-20.4z" /></svg>; // Заглушка, используем FontAwesome аналог
const FaCrown = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="12" height="12"><path d="M528 448H112c-8.8 0-16-7.2-16-16V96c0-8.8 7.2-16 16-16h416c8.8 0 16 7.2 16 16v336c0 8.8-7.2 16-16 16zM64 48C28.7 48 0 76.7 0 112v336c0 35.3 28.7 64 64 64h512c35.3 0 64-28.7 64-64V112c0-35.3-28.7-64-64-64H64zm85.5 197L24 167c-13.3-13.3-13.3-34.9 0-48.2s34.9-13.3 48.2 0l82.6 82.6 77.2-154.4c6.6-13.2 22.8-18.7 36-12.1s18.7 22.8 12.1 36L192.8 245.3l69.7 139.3c6.6 13.2 22.8 18.7 36 12.1s18.7-22.8 12.1-36L257.2 245.3l77.2-154.4c6.6-13.2 22.8-18.7 36-12.1s18.7 22.8 12.1 36L294.1 245l115.4-82.6c13.3-13.3 34.9-13.3 48.2 0s13.3 34.9 0 48.2l-125.5 78L490.5 245l82.6-115.4c13.3-13.3 34.9-13.3 48.2 0s13.3 34.9 0 48.2L473 342.5l-85.5 82.6c-13.3 13.3-34.9 13.3-48.2 0s-13.3-34.9 0-48.2l82.6-82.6L320 256l-102 102c-13.3 13.3-34.9 13.3-48.2 0s-13.3-34.9 0-48.2l82.6-82.6L149.5 245z" fill="currentColor" /></svg>; // Реальная корона (упрощенная)
const IconStar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>;
const IconPaw = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.3"><path d="M17.65 6.35C16.2 7.8 14.2 7.8 12.75 6.35C11.3 4.9 11.3 2.9 12.75 1.45C14.2 0 16.2 0 17.65 1.45C19.1 2.9 19.1 4.9 17.65 6.35ZM6.35 6.35C7.8 4.9 7.8 2.9 6.35 1.45C4.9 0 2.9 0 1.45 1.45C0 2.9 0 4.9 1.45 6.35C2.9 7.8 4.9 7.8 6.35 6.35ZM22.55 1.45C21.1 0 19.1 0 17.65 1.45C16.2 2.9 16.2 4.9 17.65 6.35C19.1 7.8 21.1 7.8 22.55 6.35C24 4.9 24 2.9 22.55 1.45ZM1.45 12.55C2.9 11.1 4.9 11.1 6.35 12.55C7.8 14 7.8 16 6.35 17.45C4.9 18.9 2.9 18.9 1.45 17.45C0 16 0 14 1.45 12.55ZM12 9C9.24 9 7 11.24 7 14C7 16.76 9.24 19 12 19C14.76 19 17 16.76 17 14C17 11.24 14.76 9 12 9ZM12 24C9.24 24 7 21.76 7 19H17C17 21.76 14.76 24 12 24Z" /></svg>;
const IconLocation = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconHeart = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const IconCrownSmall = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>;

// Словарь для перевода единиц измерения (как в React Native)
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

const SitterCardWeb: React.FC<SitterCardProps> = ({ data, isHovered, onHover, onLeave }) => {
    const { t, i18n } = useTranslation();

    // Данные
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
        id
    } = data;

    // Аватар: сначала превью, потом оригинал, иначе заглушка
    const avatarUri = data.avatar?.data?.preview_url || data.avatar?.data?.url;

    // Рейтинг
    const ratingValue = user_rating ? parseFloat(user_rating) : 0;
    const displayRating = ratingValue > 0
        ? ratingValue.toFixed(1)
        : t('common.noRatingShort', '—'); // Если i18n нет, будет прочерк

    // Отзывы
    let reviewTextToDisplay = '';
    if (reviews_count > 0) {
        reviewTextToDisplay = `(${reviews_count})`;
    } else {
    }

    // Цена
    const finalCurrencySymbol = currency_symbol || (currency_code === 'RUB' ? '₽' : currency_code);
    let priceDisplay = t('sitterCard.price_on_request', 'По запросу');
    let priceLabel = '';

    if (service_price !== null && service_price !== undefined) {
        // Логика единиц измерения
        const unitKey = `SERVICE_UNIT_${(service_price_unit || '').toUpperCase()}`;
        // Пробуем перевести через i18n, если нет - берем из словаря, если нет - оригинал
        let translatedUnit = t(unitKey, { defaultValue: '' });
        if (!translatedUnit && service_price_unit) {
            translatedUnit = unitTranslations[service_price_unit] || service_price_unit;
        }

        const unitText = translatedUnit ? ` / ${translatedUnit}` : '';

        // Форматирование числа
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