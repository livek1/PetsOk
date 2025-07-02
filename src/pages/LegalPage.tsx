import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import style from '../style/pages/LegalPage.module.scss'; // Стили для этой страницы

interface LegalPageProps {
    contentKey: 'terms' | 'privacy' | 'cookie';
}

interface ContentItem {
    type: 'h1' | 'h2' | 'h3' | 'p' | 'ul';
    text?: string;
    items?: string[]; // для списков ul
}

const LegalPage: React.FC<LegalPageProps> = ({ contentKey }) => {
    const { t } = useTranslation();

    // Получаем весь объект для страницы
    const pageData = t(`legalContent.${contentKey}`, { returnObjects: true }) as {
        title: string;
        updateDate?: string;
        tableOfContents?: string[];
        content: ContentItem[];
    };

    // Проверка на случай, если контент еще не добавлен
    if (!pageData || !pageData.content || pageData.content.length === 0) {
        return (
            <div className={style.legalPageContainer}>
                <Helmet>
                    <title>{t(`footer.legal.${contentKey}`)} - PetsOk</title>
                    <meta name="robots" content="noindex, follow" />
                </Helmet>
                <h1>{t(`footer.legal.${contentKey}`)}</h1>
                <p>Содержимое этой страницы скоро появится.</p>
            </div>
        );
    }

    const { title, updateDate, content } = pageData;

    // Функция для рендеринга основного контента
    const renderContent = () => {
        return content.map((item, index) => {
            // Используем dangerouslySetInnerHTML для поддержки тегов <strong>
            const props = { key: index, dangerouslySetInnerHTML: { __html: item.text || '' } };

            switch (item.type) {
                case 'h1':
                    return <h1 {...props}></h1>;
                case 'h2':
                    return <h2 {...props}></h2>;
                case 'h3':
                    return <h3 {...props}></h3>;
                case 'p':
                    return <p {...props}></p>;
                case 'ul': // Для возможного будущего расширения
                    return (
                        <ul key={index}>
                            {item.items?.map((li, liIndex) => <li key={liIndex}>{li}</li>)}
                        </ul>
                    );
                default:
                    return null;
            }
        });
    };



    return (
        <>
            <Helmet>
                <title>{title} - PetsOk</title>
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            <div className={style.legalPageContainer}>
                <h1>{title}</h1>
                {updateDate && <p className={style.updateDate}>{updateDate}</p>}


                <div className={style.legalPageContent}>
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default LegalPage;