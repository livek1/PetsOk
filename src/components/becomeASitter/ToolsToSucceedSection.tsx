// --- File: components/becomeASitter/ToolsToSucceedSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/ToolsToSucceedSection.scss';

// Иконки
const IconZeroPercent: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM10.87 14.53H8v-2h2.87c.22 0 .42-.1.57-.27.15-.17.23-.39.23-.63s-.08-.46-.23-.63c-.15-.17-.35-.27-.57-.27H8v-2h2.87c.89 0 1.63.29 2.13.87.5.58.75 1.33.75 2.25s-.25 1.67-.75 2.25c-.5.58-1.24.87-2.13.87z" /></svg>;
const IconAppManagement: React.FC = () => <svg viewBox="0 0 24 24" width="24" height="24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" fill="currentColor" /></svg>;
const IconSupportTeam: React.FC = () => <svg viewBox="0 0 24 24" width="24" height="24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor" /></svg>;

const ToolsToSucceedSection: React.FC = () => {
    const { t } = useTranslation();

    const tools = [
        {
            icon: <IconZeroPercent />,
            titleKey: "sitterTools.specialConditions.title",
            descriptionKey: "sitterTools.specialConditions.desc",
        },
        {
            icon: <IconAppManagement />,
            titleKey: "sitterTools.app.title",
            descriptionKey: "sitterTools.app.desc",
        },
        {
            icon: <IconSupportTeam />,
            titleKey: "sitterTools.support.titleUpdated",
            descriptionKey: "sitterTools.support.descUpdated",
        },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
    };

    const textContentVariants = {
        hidden: { opacity: 0, x: 30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const imageVariants = {
        hidden: { opacity: 0, x: -30, scale: 0.95 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
    };

    return (
        <motion.section
            className="tools-succeed-section wrapper"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={sectionVariants}
        >
            <motion.div className="tools-succeed-section__image-wrapper" variants={imageVariants}>
                <img src="/images/tools-for-success.svg" alt={t('sitterTools.imageAlt', 'Инструменты для ситтеров PetsOk')} />
            </motion.div>
            <div className="tools-succeed-section__text-content">
                <motion.h2 variants={textContentVariants}>
                    {t('sitterTools.title', 'Инструменты для вашего успеха')}
                </motion.h2>
                <ul className="tools-succeed-section__tools-list">
                    {tools.map((tool, index) => (
                        <motion.li key={index} className="tool-item" variants={textContentVariants}>
                            <div className="tool-item__icon">{tool.icon}</div>
                            <div className="tool-item__details">
                                <h3>{t(tool.titleKey)}</h3>
                                <p>{t(tool.descriptionKey)}</p>
                            </div>
                        </motion.li>
                    ))}
                </ul>
                <motion.blockquote className="tools-succeed-section__quote" variants={textContentVariants}>
                    <p>"{t('sitterTools.quoteText', 'Благодаря приложению PetsOk, я мгновенно узнаю о запросах и быстро отвечаю!')}"</p>
                    <footer>- {t('sitterTools.quoteAuthor', 'Елена К.')}</footer>
                </motion.blockquote>
            </div>
        </motion.section>
    );
};

export default ToolsToSucceedSection;