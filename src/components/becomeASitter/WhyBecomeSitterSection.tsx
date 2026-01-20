// --- File: src/components/becomeASitter/WhyBecomeSitterSection.tsx ---
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../style/components/becomeASitter/WhyBecomeSitterSection.scss';

// Иконки
const IconZeroPercent = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="#FFC107"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>;
const IconFreedom = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="#3598FE"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>;
const IconSafety = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="#38A169"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>;
const IconClients = () => <svg viewBox="0 0 24 24" width="48" height="48" fill="#E53E3E"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>;

const WhyBecomeSitterSection: React.FC = () => {
    const { t } = useTranslation();

    const benefits = [
        {
            id: 'benefit1',
            icon: <IconZeroPercent />,
            titleKey: 'becomeSitter.benefit1Title',
            descriptionKey: 'becomeSitter.benefit1Desc',
            isHighlight: true // Флаг для выделения карточки
        },
        { id: 'benefit2', icon: <IconFreedom />, titleKey: 'becomeSitter.benefit2Title', descriptionKey: 'becomeSitter.benefit2Desc' },
        { id: 'benefit3', icon: <IconSafety />, titleKey: 'becomeSitter.benefit3Title', descriptionKey: 'becomeSitter.benefit3Desc' },
        { id: 'benefit4', icon: <IconClients />, titleKey: 'becomeSitter.benefit4Title', descriptionKey: 'becomeSitter.benefit4Desc' },
    ];

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <motion.section
            className="why-become-sitter"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <div className="wrapper">
                <motion.h2 className="why-become-sitter__title" variants={itemVariants}>
                    {t('becomeSitter.benefitsTitle')}
                </motion.h2>

                <div className="why-become-sitter__benefits-grid">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.id}
                            className={`benefit-card ${benefit.isHighlight ? 'benefit-card--highlight' : ''}`}
                            custom={index}
                            variants={itemVariants}
                        >
                            <div className="benefit-card__icon-wrapper">{benefit.icon}</div>
                            <h3 className="benefit-card__title">{t(benefit.titleKey)}</h3>
                            <p className="benefit-card__description">{t(benefit.descriptionKey)}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default WhyBecomeSitterSection;