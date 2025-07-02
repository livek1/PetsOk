// --- File: src/components/becomeASitter/FinalCTASection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/FinalCTASection.scss';

const FinalCTASection: React.FC = () => {
    const { t } = useTranslation();

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
    };

    const buttonVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "backOut", delay: 0.4 } },
    };

    return (
        <motion.section
            className="final-cta-sitter wrapper" // Стили остаются
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
            <div className="final-cta-sitter__overlay"></div>
            <div className="final-cta-sitter__content">
                <motion.h2 className="final-cta-sitter__title" variants={itemVariants}>
                    {t('finalCtaSitter.titleUpdated', 'Не упустите свой шанс — зарабатывайте больше с PetsOk!')}
                </motion.h2>
                <motion.p className="final-cta-sitter__subtitle" variants={itemVariants}>
                    {t('finalCtaSitter.subtitleUpdated', '0% комиссии, гибкий график и благодарные клиенты ждут вас. Присоединяйтесь к нашей дружной команде профессионалов уже сегодня!')}
                </motion.p>
                <motion.a
                    href="/sitter-registration" // ИЗМЕНИТЕ НА РЕАЛЬНЫЙ ПУТЬ
                    className="final-cta-sitter__button" // Стили остаются
                    variants={buttonVariants}
                    whileHover={{ scale: 1.05, y: -3, boxShadow: "0px 10px 30px rgba(255, 255, 255, 0.35)" }}
                    whileTap={{ scale: 0.98 }}
                >
                    {t('finalCtaSitter.ctaUpdated', 'Присоединиться к PetsOk (0% Комиссии)')}
                </motion.a>
            </div>
        </motion.section>
    );
};

export default FinalCTASection;