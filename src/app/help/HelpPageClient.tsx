// --- File: src/app/help/HelpPageClient.tsx ---
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';
import { setAuthRedirectPath } from '@/store/slices/authSlice';

import style from '@/style/pages/HelpPage.module.scss';
import FaqItem from '@/components/help/FaqItem';
import { getHelpContent, HelpSection, HelpItem } from '@/services/api';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Ленивая загрузка модалки
const AuthModal = dynamic(
    () => import('@/components/modals/AuthModal').then(mod => mod.AuthModal),
    { ssr: false }
);

// Иконка поиска
const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

// Категории для табов. 
const TABS = [
    { key: 'all', labelKey: 'helpPage.categories.all' },
    { key: 'clients', labelKey: 'helpPage.categories.clients' },
    { key: 'sitters', labelKey: 'helpPage.categories.sitters' },
    { key: 'safety', labelKey: 'helpPage.categories.safety' },
    { key: 'payments', labelKey: 'helpPage.categories.payments' },
];

export default function HelpPageClient() {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    // Состояния для Хедера и Модалки
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

    // Состояния для контента Помощи
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sections, setSections] = useState<HelpSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleAuthClick = (mode: 'login' | 'register') => {
        dispatch(setAuthRedirectPath(null));
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    // Функция загрузки данных
    const fetchData = useCallback(async (query: string, category: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getHelpContent(query, category);
            setSections(response.data || []);
        } catch (err) {
            console.error(err);
            setError(t('common.errorLoadingData', 'Не удалось загрузить данные. Попробуйте позже.'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    // Эффект для дебаунса поиска и смены категории
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(searchQuery, activeCategory);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, activeCategory, fetchData]);

    // Собираем все вопросы в один плоский список
    const allQuestions: HelpItem[] = sections.flatMap(section => section.items?.data || []);

    return (
        <>
            <Header onAuthClick={handleAuthClick} />

            <div className={style.pageWrapper}>
                {/* Hero Section */}
                <div className={style.heroSection}>
                    <h1 className={style.title}>{t('helpPage.title')}</h1>
                    <p className={style.subtitle}>{t('helpPage.subtitle')}</p>

                    <div className={style.searchContainer}>
                        <div className={style.searchIcon}><SearchIcon /></div>
                        <input
                            type="text"
                            className={style.searchInput}
                            placeholder={t('helpPage.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className={style.contentContainer}>
                    {/* Categories */}
                    <div className={style.categoriesList}>
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`${style.categoryTab} ${activeCategory === tab.key ? style.active : ''}`}
                                onClick={() => setActiveCategory(tab.key)}
                            >
                                {t(tab.labelKey)}
                            </button>
                        ))}
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                            {t('common.loading', 'Загрузка...')}
                        </div>
                    )}

                    {/* Error State */}
                    {!isLoading && error && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#E53E3E' }}>
                            {error}
                        </div>
                    )}

                    {/* FAQ List */}
                    {!isLoading && !error && (
                        <div className={style.faqList}>
                            {allQuestions.length > 0 ? (
                                allQuestions.map(item => (
                                    <FaqItem
                                        key={item.id}
                                        question={item.question}
                                        answer={item.answer}
                                    />
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
                                    {searchQuery
                                        ? `${t('helpPage.nothingFound', 'Ничего не найдено по запросу')} "${searchQuery}"`
                                        : t('helpPage.emptyCategory', 'В этой категории пока нет вопросов.')
                                    }
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contact Footer */}
                    <div className={style.contactSection}>
                        <h2>{t('helpPage.contactTitle', 'Не нашли ответ на свой вопрос?')}</h2>
                        <p>{t('helpPage.contactText', 'Наша служба поддержки работает ежедневно. Напишите нам, и мы поможем разобраться в любой ситуации.')}</p>
                        <a href="mailto:contact@petsok.ru" className={style.contactBtn}>
                            {t('helpPage.contactBtn', 'Написать в поддержку')}
                        </a>
                    </div>
                </div>
            </div>

            <Footer />

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
            />
        </>
    );
}