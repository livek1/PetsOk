"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import style from '../../../style/pages/SitterReferencePage.module.scss'; // Проверьте правильность пути
import { getSitterReferenceInfo, submitSitterReference, SitterReferenceInfo } from '../../../services/api'; // Проверьте путь

// Иконки
const StarIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);
const CheckIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const LockIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

export default function SitterReferencePage() {
    const params = useParams();
    const token = params?.token as string;
    const { t } = useTranslation();

    const [info, setInfo] = useState<SitterReferenceInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [authorName, setAuthorName] = useState('');
    const [contact, setContact] = useState(''); // Email or Phone
    const [relation, setRelation] = useState('');
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');

    useEffect(() => {
        const fetchInfo = async () => {
            if (!token) return;
            try {
                const data = await getSitterReferenceInfo(token);
                setInfo(data);
            } catch (e: any) {
                console.error(e);
                setError(e.response?.status === 404
                    ? t('referencePage.errors.notFound', 'Ссылка устарела или не существует.')
                    : t('common.errorOccurred', 'Произошла ошибка')
                );
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [token, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        // Basic validation
        if (rating === 0) {
            alert(t('referencePage.errors.ratingRequired', 'Пожалуйста, укажите оценку'));
            return;
        }
        if (!contact.trim()) {
            alert(t('referencePage.errors.contactRequired', 'Пожалуйста, укажите контакты'));
            return;
        }

        setSubmitting(true);
        try {
            // Определяем, что ввел пользователь (email или телефон)
            const isEmail = contact.includes('@');

            await submitSitterReference({
                token,
                author_name: authorName,
                author_email: isEmail ? contact : undefined,
                author_phone: !isEmail ? contact : undefined,
                relationship_type: relation,
                rating,
                content
            });
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e: any) {
            console.error(e);
            alert(e.response?.data?.message || 'Ошибка отправки');
        } finally {
            setSubmitting(false);
        }
    };

    // 1. Loading
    if (loading) {
        return (
            <div className={style.pageWrapper}>
                <div className={style.loadingState}>{t('loading', 'Загрузка...')}</div>
            </div>
        );
    }

    // 2. Error (Not Found)
    if (error || !info) {
        return (
            <div className={style.pageWrapper}>
                <div className={style.container}>
                    <div className={style.limitState}>
                        <h2>{t('common.error', 'Ошибка')}</h2>
                        <p>{error}</p>
                        <Link href="/" className={style.homeLink}>На главную</Link>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Limit Reached (Ситтер уже набрал 5 отзывов)
    if (!info.can_leave_reference) {
        return (
            <div className={style.pageWrapper}>
                <title>{t('referencePage.limitReachedTitle', 'Лимит отзывов достигнут')} | PetsOk</title>
                <div className={style.container}>
                    <div className={style.limitState}>
                        <div className={style.iconCircle}><LockIcon /></div>
                        <h2>{t('referencePage.limitReachedTitle', 'Лимит отзывов достигнут')}</h2>
                        <p>{t('referencePage.limitReachedText', 'Этот ситтер уже собрал необходимое количество рекомендаций.')}</p>
                        <Link href="/" className={style.homeLink}>Перейти на PetsOk</Link>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Success State (Отзыв отправлен)
    if (isSuccess) {
        return (
            <div className={style.pageWrapper}>
                <title>{t('referencePage.successTitle', 'Спасибо за рекомендацию!')} | PetsOk</title>
                <div className={style.container}>
                    <div className={style.successState}>
                        <div className={style.iconCircle}><CheckIcon /></div>
                        <h2>{t('referencePage.successTitle', 'Спасибо за рекомендацию!')}</h2>
                        <p>{t('referencePage.successText', 'Ваш отзыв успешно сохранен и поможет ситтеру в работе.')}</p>
                        <Link href="/" className={style.homeLink}>Узнать больше о PetsOk</Link>
                    </div>
                </div>
            </div>
        );
    }

    // 5. Form State
    return (
        <div className={style.pageWrapper}>
            <title>{t('referencePage.title', 'Оставить рекомендацию')} | PetsOk</title>

            <div className={style.container}>
                <div className={style.header}>
                    <div className={style.avatarWrapper}>
                        {info.avatar_url ? (
                            <img src={info.avatar_url} alt={info.sitter_name} className={style.avatar} />
                        ) : (
                            <div className={style.placeholderAvatar}>
                                {info.sitter_name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <h1 className={style.title}>{t('referencePage.title', 'Оставить рекомендацию')}</h1>
                    <p className={style.subtitle}>
                        {t('referencePage.subtitle', { name: info.sitter_name, defaultValue: `Пожалуйста, поделитесь впечатлениями о работе с ${info.sitter_name}` })}
                    </p>
                </div>

                <form className={style.form} onSubmit={handleSubmit}>

                    {/* Rating */}
                    <div className={style.ratingContainer}>
                        <span className={style.ratingLabel}>{t('referencePage.form.ratingLabel', 'Ваша оценка')} *</span>
                        <div className={style.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`${style.starBtn} ${rating >= star ? style.active : ''}`}
                                    onClick={() => setRating(star)}
                                >
                                    <StarIcon />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={style.inputGroup}>
                        <label className={style.label}>{t('referencePage.form.nameLabel', 'Ваше имя')} *</label>
                        <input
                            required
                            className={style.input}
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder={t('referencePage.form.namePlaceholder', 'Иван Иванов')}
                        />
                    </div>

                    <div className={style.inputGroup}>
                        <label className={style.label}>{t('referencePage.form.contactLabel', 'Контактные данные')} *</label>
                        <input
                            required
                            className={style.input}
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder={t('referencePage.form.contactPlaceholder', 'Email или номер телефона')}
                        />
                        <span className={style.helperText}>{t('referencePage.form.contactHint', 'Мы не публикуем эти данные, они нужны только для модерации')}</span>
                    </div>

                    <div className={style.inputGroup}>
                        <label className={style.label}>{t('referencePage.form.relationLabel', 'Как вы знакомы с ситтером?')}</label>
                        <input
                            className={style.input}
                            value={relation}
                            onChange={(e) => setRelation(e.target.value)}
                            placeholder={t('referencePage.form.relationPlaceholder', 'Например: Пользовался услугами, Друг, Коллега')}
                        />
                    </div>

                    <div className={style.inputGroup}>
                        <label className={style.label}>{t('referencePage.form.contentLabel', 'Ваш отзыв')} *</label>
                        <textarea
                            required
                            className={style.textarea}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={t('referencePage.form.contentPlaceholder', 'Напишите пару слов о вашем опыте...')}
                            minLength={10}
                        />
                    </div>

                    <button
                        type="submit"
                        className={style.submitBtn}
                        disabled={submitting}
                    >
                        {submitting ? t('referencePage.form.submitting', 'Отправка...') : t('referencePage.form.submitButton', 'Отправить рекомендацию')}
                    </button>
                </form>
            </div>
        </div>
    );
}