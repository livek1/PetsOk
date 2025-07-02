// --- File: src/components/becomeASitter/FlexibilitySection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/FlexibilitySection.scss';

// Пример иконок
const IconCalendar: React.FC = () => <svg viewBox="0 0 24 24" width="24" height="24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" fill="currentColor" /></svg>;
const IconPriceTag: React.FC = () => <svg viewBox="0 0 24 24" width="24" height="24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill="currentColor" /></svg>;
const IconPetPrefs: React.FC = () => <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor" /></svg>;

const FlexibilitySection: React.FC = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: <IconCalendar />,
            textKey: "sitterFlexibility.feature1",
            defaultText: "Устанавливайте собственный график и доступность",
        },
        {
            icon: <IconPriceTag />,
            textKey: "sitterFlexibility.feature2",
            defaultText: "Предлагайте любую комбинацию услуг по уходу за питомцами",
        },
        {
            icon: <IconPetPrefs />,
            textKey: "sitterFlexibility.feature3",
            defaultText: "Определяйте размер, возраст и другие предпочтения по питомцам, с которыми вы готовы работать",
        },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
    };

    const textContentVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const imageVariants = {
        hidden: { opacity: 0, x: 30, scale: 0.95 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
    };

    const listItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };


    return (
        <motion.section
            className="flexibility-section wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={sectionVariants}
        >
            <div className="flexibility-section__text-content">
                <motion.h2 variants={textContentVariants}>
                    {t('sitterFlexibility.title', 'Гибкость дает вам контроль')}
                </motion.h2>
                <ul className="flexibility-section__features-list">
                    {features.map((feature, index) => (
                        <motion.li key={index} variants={listItemVariants} custom={index}>
                            <span className="feature-icon">{feature.icon}</span>
                            <span>{t(feature.textKey, feature.defaultText)}</span>
                        </motion.li>
                    ))}
                </ul>
                <motion.blockquote className="flexibility-section__quote" variants={textContentVariants}>
                    <p>"{t('sitterFlexibility.quoteText', 'Это легко. Я просто захожу в календарь и отмечаю себя доступной, когда хочу.')}"</p>
                    <footer>- {t('sitterFlexibility.quoteAuthor', 'Ирина С.')}</footer>
                </motion.blockquote>
            </div>
            <motion.div className="flexibility-section__image-wrapper" variants={imageVariants}>
            </motion.div>
        </motion.section>
    );
};

export default FlexibilitySection;