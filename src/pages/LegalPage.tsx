import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import style from '../style/pages/LegalPage.module.scss';

interface LegalPageProps {
    contentKey: 'terms' | 'privacy' | 'cookie';
}

interface ContentItem {
    type: 'h1' | 'h2' | 'h3' | 'p' | 'ul';
    text?: string;
    items?: string[];
}

const LegalPage: React.FC<LegalPageProps> = ({ contentKey }) => {
    const { t } = useTranslation();

    const pageData = t(`legalContent.${contentKey}`, { returnObjects: true }) as {
        title: string;
        updateDate?: string;
        content: ContentItem[];
    };

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

    const renderContent = () => {
        return content.map((item, index) => {
            // Общие пропсы для текста
            const commonProps = {
                key: index,
                dangerouslySetInnerHTML: { __html: item.text || '' }
            };

            switch (item.type) {
                case 'h1':
                    return <h1 {...commonProps}></h1>;
                case 'h2':
                    return <h2 {...commonProps}></h2>;
                case 'h3':
                    return <h3 {...commonProps}></h3>;
                case 'p':
                    return <p {...commonProps}></p>;
                case 'ul':
                    return (
                        <ul key={index} className={style.list}>
                            {item.items?.map((liText, liIndex) => (
                                // ВАЖНО: Используем dangerouslySetInnerHTML для элементов списка
                                <li
                                    key={liIndex}
                                    dangerouslySetInnerHTML={{ __html: liText }}
                                />
                            ))}
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