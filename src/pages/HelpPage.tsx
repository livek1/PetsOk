import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import style from '../style/pages/HelpPage.module.scss';
import FaqItem from '../components/help/FaqItem';
import { getHelpContent, HelpSection, HelpItem } from '../services/api'; // Убедитесь, что путь к api правильный

// Иконка поиска
const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

// Категории для табов. 
// Ключи должны совпадать со 'slug' в базе данных (HelpSection).
const TABS = [
    { key: 'all', labelKey: 'helpPage.categories.all' },
    { key: 'clients', labelKey: 'helpPage.categories.clients' },
    { key: 'sitters', labelKey: 'helpPage.categories.sitters' },
    { key: 'safety', labelKey: 'helpPage.categories.safety' },
    // Можно добавить 'payments', если такая секция есть в БД
];

const HelpPage: React.FC = () => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Состояние данных
    const [sections, setSections] = useState<HelpSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Функция загрузки данных
    const fetchData = useCallback(async (query: string, category: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getHelpContent(query, category);
            // Если используется Fractal, данные обычно в response.data
            setSections(response.data || []);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить данные. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Эффект для дебаунса поиска и смены категории
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(searchQuery, activeCategory);
        }, 500); // Задержка 500мс, чтобы не спамить API при вводе

        return () => clearTimeout(timer);
    }, [searchQuery, activeCategory, fetchData]);

    // Собираем все вопросы из всех секций в один плоский список для отображения
    // (Бэкенд уже отфильтровал секции и вопросы согласно запросу)
    const allQuestions: HelpItem[] = sections.flatMap(section => section.items.data);

    return (
        <div className={style.pageWrapper}>
            <Helmet>
                <title>{t('helpPage.metaTitle', 'Помощь и поддержка - PetsOk')}</title>
                <meta name="description" content={t('helpPage.metaDesc', 'Ответы на частые вопросы о сервисе PetsOk')} />
            </Helmet>

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
                        Загрузка...
                    </div>
                )}

                {/* Error State */}
                {!isLoading && error && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
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
                                    // Бэкенд возвращает уже переведенный текст в полях question и answer
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
                    <h2>{t('helpPage.contactTitle')}</h2>
                    <p>{t('helpPage.contactText')}</p>
                    <a href="mailto:contact@petsok.ru" className={style.contactBtn}>
                        {t('helpPage.contactBtn')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;