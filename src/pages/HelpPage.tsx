import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import style from '../style/pages/HelpPage.module.scss';
import FaqItem from '../components/help/FaqItem';

// Иконка поиска
const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

// Типы данных (в будущем придут с бэка)
type Category = 'all' | 'clients' | 'sitters' | 'safety' | 'payments';

interface Question {
    id: number;
    category: Category;
    questionKey: string;
    answerKey: string;
}

const HelpPage: React.FC = () => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState<Category>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // --- MOCK DATA (Имитация ответа API) ---
    const questions: Question[] = [
        { id: 1, category: 'clients', questionKey: 'helpPage.q1', answerKey: 'helpPage.a1' },
        { id: 2, category: 'sitters', questionKey: 'helpPage.q2', answerKey: 'helpPage.a2' },
        { id: 3, category: 'safety', questionKey: 'helpPage.q3', answerKey: 'helpPage.a3' },
        { id: 4, category: 'payments', questionKey: 'helpPage.q4', answerKey: 'helpPage.a4' },
        // Дублируем для наполнения (в реальности будут разные)
        { id: 5, category: 'clients', questionKey: 'Как отменить заказ?', answerKey: 'Отменить заказ можно в личном кабинете. Если до начала осталось более 24 часов, возврат полный.' },
        { id: 6, category: 'sitters', questionKey: 'Сколько я заработаю?', answerKey: 'Вы сами устанавливаете цены. Сервис не берет комиссию с ситтеров.' },
    ];

    // Категории для табов
    const categories: { key: Category; labelKey: string }[] = [
        { key: 'all', labelKey: 'helpPage.categories.all' },
        { key: 'clients', labelKey: 'helpPage.categories.clients' },
        { key: 'sitters', labelKey: 'helpPage.categories.sitters' },
        { key: 'safety', labelKey: 'helpPage.categories.safety' },
        { key: 'payments', labelKey: 'helpPage.categories.payments' },
    ];

    // Фильтрация
    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            // 1. Фильтр по категории
            if (activeCategory !== 'all' && q.category !== activeCategory) return false;

            // 2. Фильтр по поиску (ищем в переведенном тексте)
            if (searchQuery) {
                // Если ключ перевода есть в i18n, берем перевод, иначе сам текст
                const qText = q.questionKey.includes('helpPage.') ? t(q.questionKey) : q.questionKey;
                const aText = q.answerKey.includes('helpPage.') ? t(q.answerKey) : q.answerKey;
                const query = searchQuery.toLowerCase();

                return qText.toLowerCase().includes(query) || aText.toLowerCase().includes(query);
            }

            return true;
        });
    }, [activeCategory, searchQuery, questions, t]);

    return (
        <div className={style.pageWrapper}>
            <Helmet>
                <title>Помощь и поддержка - PetsOk</title>
                <meta name="description" content="Ответы на частые вопросы о сервисе PetsOk" />
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
                    {categories.map(cat => (
                        <button
                            key={cat.key}
                            className={`${style.categoryTab} ${activeCategory === cat.key ? style.active : ''}`}
                            onClick={() => setActiveCategory(cat.key)}
                        >
                            {t(cat.labelKey)}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className={style.faqList}>
                    {filteredQuestions.length > 0 ? (
                        filteredQuestions.map(item => (
                            <FaqItem
                                key={item.id}
                                question={item.questionKey.includes('helpPage.') ? t(item.questionKey) : item.questionKey}
                                answer={item.answerKey.includes('helpPage.') ? t(item.answerKey) : item.answerKey}
                            />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
                            Ничего не найдено по запросу "{searchQuery}"
                        </div>
                    )}
                </div>

                {/* Contact Footer */}
                <div className={style.contactSection}>
                    <h2>{t('helpPage.contactTitle')}</h2>
                    <p>{t('helpPage.contactText')}</p>
                    <a href="mailto:support@petsok.ru" className={style.contactBtn}>
                        {t('helpPage.contactBtn')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;