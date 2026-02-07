// --- File: src/components/home/TestimonialsSection.tsx ---
import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import style from '../../style/components/TestimonialsSection.module.scss';

// SVG Icons
const StarIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

const QuoteIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    </svg>
);

const VerifiedBadgeIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
);

const StarBigIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

// --- ОТДЕЛЬНЫЙ КОМПОНЕНТ КАРТОЧКИ ДЛЯ УПРАВЛЕНИЯ ЗАГРУЗКОЙ ФОТО ---
const ReviewCard = ({ review }: { review: any }) => {
    const { t } = useTranslation();
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className={style.storyCard}>
            {/* 1. Верхняя часть: Фото питомца */}
            <div className={style.imageHeader}>
                <img
                    src={review.image}
                    alt={t(review.petKey)}
                    // Добавляем класс loaded, когда картинка загрузилась
                    className={`${style.petImage} ${imageLoaded ? style.loaded : ''}`}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />

                {/* Статус заказа */}
                <div className={style.statusBadge}>
                    <VerifiedBadgeIcon />
                    <span>{review.statusText}</span>
                </div>
            </div>

            {/* 2. Нижняя часть: Текст и Автор */}
            <div className={style.cardBody}>
                <div className={style.quoteMark}>
                    <QuoteIcon />
                </div>

                <p className={style.reviewText}>
                    {t(review.textKey)}
                </p>

                <div className={style.cardFooter}>
                    <img src={review.avatar} alt={t(review.nameKey)} className={style.authorAvatar} />
                    <div className={style.authorInfo}>
                        <strong>{t(review.nameKey)}</strong>
                        <span>{t(review.petKey)}</span>
                    </div>
                    <div className={style.rating}>
                        {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TestimonialsSection: React.FC = () => {
    const { t } = useTranslation();
    const scrollRef = useRef(null);
    const isInView = useInView(scrollRef, { once: true, margin: "-100px" });

    const CDN_BASE = "https://2865b09b-9c30-4898-857f-c4fc1f7d0cab.selstorage.ru/reviews_land";
    const DEFAULT_AVATAR = "https://2865b09b-9c30-4898-857f-c4fc1f7d0cab.selstorage.ru/users/default.png";

    // Исходные данные (порядок: 1, 6, 9, 10, остальные)
    const reviews = [
        {
            id: 1,
            textKey: 'testimonials.review1.text',
            nameKey: 'testimonials.review1.author',
            petKey: 'testimonials.review1.pet',
            image: `${CDN_BASE}/1.jpeg`,
            avatar: DEFAULT_AVATAR, // Оставляем
            statusText: "Видеоотчет"
        },
        {
            id: 6,
            textKey: 'testimonials.review6.text',
            nameKey: 'testimonials.review6.author',
            petKey: 'testimonials.review6.pet',
            image: `${CDN_BASE}/6.jpeg`,
            avatar: DEFAULT_AVATAR, // Дефолт
            statusText: "Активный выгул"
        },
        {
            id: 9,
            textKey: 'testimonials.review9.text',
            nameKey: 'testimonials.review9.author',
            petKey: 'testimonials.review9.pet',
            image: `${CDN_BASE}/9.jpeg`,
            avatar: DEFAULT_AVATAR, // Оставляем
            statusText: "Визит няни"
        },
        {
            id: 10,
            textKey: 'testimonials.review10.text',
            nameKey: 'testimonials.review10.author',
            petKey: 'testimonials.review10.pet',
            image: `${CDN_BASE}/10.jpeg`,
            avatar: DEFAULT_AVATAR, // Дефолт
            statusText: "Уборка"
        },
        // Остальные по порядку
        {
            id: 2,
            textKey: 'testimonials.review2.text',
            nameKey: 'testimonials.review2.author',
            petKey: 'testimonials.review2.pet',
            image: `${CDN_BASE}/2.jpeg`,
            avatar: DEFAULT_AVATAR,
            statusText: "Передержка"
        },
        {
            id: 3,
            textKey: 'testimonials.review3.text',
            nameKey: 'testimonials.review3.author',
            petKey: 'testimonials.review3.pet',
            image: `${CDN_BASE}/3.jpeg`,
            avatar: DEFAULT_AVATAR, // Дефолт
            statusText: "Срочный заказ"
        },
        {
            id: 4,
            textKey: 'testimonials.review4.text',
            nameKey: 'testimonials.review4.author',
            petKey: 'testimonials.review4.pet',
            image: `${CDN_BASE}/4.jpeg`,
            avatar: DEFAULT_AVATAR,
            statusText: "Уход и лечение"
        },
        {
            id: 5,
            textKey: 'testimonials.review5.text',
            nameKey: 'testimonials.review5.author',
            petKey: 'testimonials.review5.pet',
            image: `${CDN_BASE}/5.jpeg`,
            avatar: DEFAULT_AVATAR,
            statusText: "Няня дома"
        },
        {
            id: 7,
            textKey: 'testimonials.review7.text',
            nameKey: 'testimonials.review7.author',
            petKey: 'testimonials.review7.pet',
            image: `${CDN_BASE}/7.jpeg`,
            avatar: DEFAULT_AVATAR,
            statusText: "Безопасная сделка"
        },
        {
            id: 8,
            textKey: 'testimonials.review8.text',
            nameKey: 'testimonials.review8.author',
            petKey: 'testimonials.review8.pet',
            image: `${CDN_BASE}/8.jpeg`,
            avatar: DEFAULT_AVATAR, // Дефолт
            statusText: "Регулярный выгул"
        }
    ];

    return (
        <section className={style.testimonialsSection} ref={scrollRef}>
            <div className={style.wrapper}>

                {/* Header */}
                <div className={style.header}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        {/* Блок рейтинга */}
                        <div className={style.ratingBlock}>
                            <div className={style.starsRow}>
                                {[...Array(5)].map((_, i) => <StarBigIcon key={i} />)}
                            </div>
                            <div className={style.ratingTextGroup}>
                                <span className={style.ratingNumber}>5.0</span>
                                <span className={style.ratingLabel}>
                                    {t('testimonials.ratingLabel', 'на основе реальных отзывов')}
                                </span>
                            </div>
                        </div>

                        <h2 className={style.title}>
                            {t('testimonials.title')}
                        </h2>
                        <p className={style.subtitle}>
                            {t('testimonials.subtitle')}
                        </p>
                    </motion.div>
                </div>

                {/* Horizontal Slider (Scrollable Container) */}
                <div className={style.sliderContainer}>
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            className={style.storyCardWrapper}
                            initial={{ opacity: 0, x: 50 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <ReviewCard review={review} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;